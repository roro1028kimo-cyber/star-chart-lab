import { startTransition, useCallback, useDeferredValue, useEffect, useState, type FormEvent } from 'react'
import { APP_COPY } from '../content'
import type {
  DashboardSection,
  ForecastHistoryEntry,
  ForecastResponse,
  NatalChartResult,
  PlaceSuggestion,
} from '../types'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const MIN_LOADING_MS = 1200
const ENTRY_TRANSITION_MS = 2200
const PREMIUM_TRANSITION_MS = 1800

export type ViewState = 'landing' | 'entry-transition' | 'dashboard' | 'premium-transition' | 'tarot'

function toApiUrl(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path
}

function buildNonJsonApiMessage() {
  return 'API 目前回傳的不是 JSON，請確認前端是否連到正確的後端服務，或檢查 VITE_API_BASE_URL / /api 代理設定。'
}

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error || 'Request failed.'
  } catch {
    return 'Request failed.'
  }
}

async function readJson<T>(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  const raw = await response.text()

  if (!contentType.includes('application/json')) {
    if (raw.trim().startsWith('<!doctype') || raw.trim().startsWith('<html')) {
      throw new Error(buildNonJsonApiMessage())
    }

    throw new Error('API 回應格式異常，請稍後再試一次。')
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error('API JSON 解析失敗，請確認後端回傳格式。')
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
  const [activeSection, setActiveSection] = useState<DashboardSection>('yearly')
  const [pendingSection, setPendingSection] = useState<DashboardSection>('yearly')
  const [vipUnlocked, setVipUnlocked] = useState(false)
  const [yearlyForecast, setYearlyForecast] = useState<ForecastResponse | null>(null)
  const [weeklyForecast, setWeeklyForecast] = useState<ForecastResponse | null>(null)
  const [yearlyForecastLoading, setYearlyForecastLoading] = useState(false)
  const [weeklyForecastLoading, setWeeklyForecastLoading] = useState(false)
  const [yearlyForecastError, setYearlyForecastError] = useState<string | null>(null)
  const [weeklyForecastError, setWeeklyForecastError] = useState<string | null>(null)
  const [yearlyHistory, setYearlyHistory] = useState<ForecastHistoryEntry[]>([])
  const [weeklyHistory, setWeeklyHistory] = useState<ForecastHistoryEntry[]>([])
  const [yearlyHistoryLoading, setYearlyHistoryLoading] = useState(false)
  const [weeklyHistoryLoading, setWeeklyHistoryLoading] = useState(false)
  const [yearlyHistoryError, setYearlyHistoryError] = useState<string | null>(null)
  const [weeklyHistoryError, setWeeklyHistoryError] = useState<string | null>(null)

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

        const payload = await readJson<PlaceSuggestion[]>(response)
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
    const timer = window.setTimeout(() => {
      if (view === 'premium-transition') {
        setVipUnlocked(true)
      }

      setView('dashboard')
      setActiveSection(view === 'entry-transition' ? 'yearly' : pendingSection)
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }, prefersReducedMotion ? 150 : delay)

    return () => {
      window.clearTimeout(timer)
    }
  }, [pendingSection, prefersReducedMotion, view])

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

  const loadForecastHistory = useCallback(
    async (kind: 'yearly' | 'weekly') => {
      if (!chart) {
        return
      }

      const setLoading = kind === 'yearly' ? setYearlyHistoryLoading : setWeeklyHistoryLoading
      const setError = kind === 'yearly' ? setYearlyHistoryError : setWeeklyHistoryError
      const setData = kind === 'yearly' ? setYearlyHistory : setWeeklyHistory

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(toApiUrl(`/api/forecasts/${kind}/history`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chart,
            locale: 'zh-TW',
            limit: 6,
          }),
        })

        if (!response.ok) {
          throw new Error(await readError(response))
        }

        const payload = await readJson<ForecastHistoryEntry[]>(response)
        setData(payload)
      } catch (error) {
        setError(error instanceof Error ? error.message : `${kind} history failed`)
      } finally {
        setLoading(false)
      }
    },
    [chart],
  )

  const loadForecast = useCallback(
    async (kind: 'yearly' | 'weekly', force = false) => {
      if (!chart) {
        return
      }

      const setLoading = kind === 'yearly' ? setYearlyForecastLoading : setWeeklyForecastLoading
      const setError = kind === 'yearly' ? setYearlyForecastError : setWeeklyForecastError
      const setData = kind === 'yearly' ? setYearlyForecast : setWeeklyForecast

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(toApiUrl(`/api/forecasts/${kind}`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chart,
            locale: 'zh-TW',
            force,
          }),
        })

        if (!response.ok) {
          throw new Error(await readError(response))
        }

        const payload = await readJson<ForecastResponse>(response)
        setData(payload)
        await loadForecastHistory(kind)
      } catch (error) {
        setError(error instanceof Error ? error.message : `${kind} forecast failed`)
      } finally {
        setLoading(false)
      }
    },
    [chart, loadForecastHistory],
  )

  useEffect(() => {
    if (!chart || view === 'landing' || view === 'entry-transition') {
      return
    }

    if (!yearlyForecast && !yearlyForecastLoading && !yearlyForecastError) {
      void loadForecast('yearly')
    } else if (!yearlyHistory.length && !yearlyHistoryLoading && !yearlyHistoryError) {
      void loadForecastHistory('yearly')
    }

    if (!weeklyForecast && !weeklyForecastLoading && !weeklyForecastError) {
      void loadForecast('weekly')
    } else if (!weeklyHistory.length && !weeklyHistoryLoading && !weeklyHistoryError) {
      void loadForecastHistory('weekly')
    }
  }, [
    chart,
    loadForecast,
    loadForecastHistory,
    view,
    yearlyForecast,
    weeklyForecast,
    yearlyForecastLoading,
    weeklyForecastLoading,
    yearlyForecastError,
    weeklyForecastError,
    yearlyHistory,
    weeklyHistory,
    yearlyHistoryLoading,
    weeklyHistoryLoading,
    yearlyHistoryError,
    weeklyHistoryError,
  ])

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

      const payload = await readJson<NatalChartResult>(response)
      const remainingDelay = Math.max(MIN_LOADING_MS - (Date.now() - requestStartedAt), 0)

      if (remainingDelay > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingDelay))
      }

      startTransition(() => {
        setChart(payload)
        setActiveSection('yearly')
        setPendingSection('yearly')
        setVipUnlocked(false)
        setYearlyForecast(null)
        setWeeklyForecast(null)
        setYearlyForecastError(null)
        setWeeklyForecastError(null)
        setYearlyHistory([])
        setWeeklyHistory([])
        setYearlyHistoryError(null)
        setWeeklyHistoryError(null)
        setView('entry-transition')
      })
    } catch (error) {
      setChartError(error instanceof Error ? error.message : '星盤生成失敗。')
      setView('landing')
    } finally {
      setChartLoading(false)
    }
  }

  function selectSection(section: DashboardSection) {
    if (section === 'vip' && !vipUnlocked) {
      setPendingSection('vip')
      setView('premium-transition')
      return
    }

    setActiveSection(section)
    setView('dashboard')
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  function openPremium() {
    setPendingSection('vip')
    setView('premium-transition')
  }

  function openTarot() {
    setView('tarot')
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  function backToDashboard(section: DashboardSection = activeSection) {
    setActiveSection(section)
    setView('dashboard')
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  function resetToLanding() {
    setView('landing')
    setChartError(null)
    setPlaceError(null)
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return {
    activeSection,
    backToDashboard,
    chart,
    chartError,
    chartLoading,
    date,
    handlePlaceQueryChange,
    handleSubmit,
    openPremium,
    openTarot,
    placeError,
    placeLoading,
    placeQuery,
    placeResults,
    resetToLanding,
    retryWeeklyForecast: () => loadForecast('weekly', true),
    retryYearlyForecast: () => loadForecast('yearly', true),
    selectPlace,
    selectSection,
    selectedPlace,
    setDate,
    setTime,
    time,
    view,
    vipUnlocked,
    weeklyForecast,
    weeklyForecastError,
    weeklyForecastLoading,
    weeklyHistory,
    weeklyHistoryError,
    weeklyHistoryLoading,
    yearlyForecast,
    yearlyForecastError,
    yearlyForecastLoading,
    yearlyHistory,
    yearlyHistoryError,
    yearlyHistoryLoading,
  }
}
