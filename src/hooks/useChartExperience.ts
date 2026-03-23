import { startTransition, useDeferredValue, useEffect, useState, type FormEvent } from 'react'
import { APP_COPY } from '../content'
import type { NatalChartResult, PlaceSuggestion } from '../types'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const MIN_LOADING_MS = 1200
const ENTRY_TRANSITION_MS = 2200
const PREMIUM_TRANSITION_MS = 1800

export type ViewState = 'landing' | 'entry-transition' | 'story' | 'premium-transition' | 'premium'

function toApiUrl(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path
}

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error || 'Request failed.'
  } catch {
    return 'Request failed.'
  }
}

export function useChartExperience({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const [date, setDate] = useState('1990-01-01')
  const [time, setTime] = useState('12:00')
  const [placeQuery, setPlaceQuery] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null)
  const [placeResults, setPlaceResults] = useState<PlaceSuggestion[]>([])
  const [placeLoading, setPlaceLoading] = useState(false)
  const [placeError, setPlaceError] = useState<string | null>(null)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [chart, setChart] = useState<NatalChartResult | null>(null)
  const [view, setView] = useState<ViewState>('landing')

  const deferredQuery = useDeferredValue(placeQuery)

  useEffect(() => {
    const query = deferredQuery.trim()

    if (selectedPlace && query === selectedPlace.label) {
      return
    }

    if (query.length < 2) {
      setPlaceResults([])
      setPlaceError(null)
      setPlaceLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setPlaceLoading(true)
      setPlaceError(null)

      try {
        const response = await fetch(toApiUrl(`/api/places/search?q=${encodeURIComponent(query)}`), {
          signal: controller.signal,
        })

        if (!response.ok) {
          const message = await readError(response)
          throw new Error(message === 'Request failed.' ? APP_COPY.placeSearchError : message)
        }

        const payload = (await response.json()) as PlaceSuggestion[]
        setPlaceResults(payload)

        if (payload.length === 0) {
          setPlaceError(APP_COPY.placeNoResults)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setPlaceResults([])
          setPlaceError(error instanceof Error && error.message !== 'Failed to fetch' ? error.message : APP_COPY.placeSearchError)
        }
      } finally {
        setPlaceLoading(false)
      }
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [deferredQuery, selectedPlace])

  useEffect(() => {
    if (view !== 'entry-transition' && view !== 'premium-transition') {
      return
    }

    const delay = view === 'entry-transition' ? ENTRY_TRANSITION_MS : PREMIUM_TRANSITION_MS
    const nextView = view === 'entry-transition' ? 'story' : 'premium'
    const timer = window.setTimeout(() => {
      setView(nextView)
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }, prefersReducedMotion ? 150 : delay)

    return () => {
      window.clearTimeout(timer)
    }
  }, [prefersReducedMotion, view])

  function handlePlaceQueryChange(nextValue: string) {
    setPlaceQuery(nextValue)
    setSelectedPlace(null)
    setPlaceError(null)
  }

  function selectPlace(place: PlaceSuggestion) {
    setSelectedPlace(place)
    setPlaceQuery(place.label)
    setPlaceResults([])
    setPlaceError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedPlace) {
      setChartError(APP_COPY.noPlaceError)
      return
    }

    const requestStartedAt = Date.now()

    setChartLoading(true)
    setChartError(null)
    setChart(null)

    try {
      const response = await fetch(toApiUrl('/api/charts/natal'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          time,
          placeLabel: selectedPlace.label,
          city: selectedPlace.city,
          countryCode: selectedPlace.countryCode,
          lat: selectedPlace.lat,
          lon: selectedPlace.lon,
        }),
      })

      if (!response.ok) {
        throw new Error(await readError(response))
      }

      const payload = (await response.json()) as NatalChartResult
      const remainingDelay = Math.max(MIN_LOADING_MS - (Date.now() - requestStartedAt), 0)

      if (remainingDelay > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingDelay))
      }

      startTransition(() => {
        setChart(payload)
        setView('entry-transition')
      })
    } catch (error) {
      setChartError(error instanceof Error ? error.message : '星盤生成失敗。')
      setView('landing')
    } finally {
      setChartLoading(false)
    }
  }

  function openPremium() {
    setView('premium-transition')
  }

  function backToStory() {
    setView('story')
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  function resetToLanding() {
    setView('landing')
    setChartError(null)
    setPlaceError(null)
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return {
    chart,
    chartError,
    chartLoading,
    date,
    handlePlaceQueryChange,
    handleSubmit,
    openPremium,
    backToStory,
    placeError,
    placeLoading,
    placeQuery,
    placeResults,
    resetToLanding,
    selectPlace,
    selectedPlace,
    setDate,
    setTime,
    time,
    view,
  }
}
