import { startTransition, useDeferredValue, useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { ChartWheel } from './components/ChartWheel'
import {
  buildMonthlyOutlook,
  buildMonthlyReminder,
  buildPersonalityOverview,
  buildWeeklyPulse,
  formatDegree,
  formatLongDate,
  getElementDisplay,
  getLocaleCopy,
  getModalityDisplay,
  getSignDisplay,
  type Locale,
} from './content'
import type { AiInsightsResponse, NatalChartResult, PlaceSuggestion, PremiumEmailPlaceholderResponse } from './types'

const AI_ROUTE = '/api/insights/ai'
const EMAIL_ROUTE = '/api/premium/email'
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const MIN_LOADING_MS = 1800
const FLIGHT_MS = 2400
const WHITEOUT_MS = 1600
const today = new Date().toISOString().slice(0, 10)
const STORY_REVEAL_ORDER = ['chart', 'personality', 'weekly', 'monthly', 'reminder', 'premium'] as const

type StoryStepId = (typeof STORY_REVEAL_ORDER)[number]
type ViewState = 'landing' | 'flight' | 'story' | 'whiteout' | 'premium'

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

function getInitialLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return 'zh-TW'
  }

  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en'
}

function App() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
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
  const [storySteps, setStorySteps] = useState<StoryStepId[]>([])
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAdvice, setAiAdvice] = useState<string | null>(null)
  const [aiProvider, setAiProvider] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [emailPlaceholder, setEmailPlaceholder] = useState<PremiumEmailPlaceholderResponse | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const copy = getLocaleCopy(locale)
  const deferredQuery = useDeferredValue(placeQuery)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(media.matches)

    update()
    media.addEventListener('change', update)

    return () => {
      media.removeEventListener('change', update)
    }
  }, [])

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
    const timeout = window.setTimeout(async () => {
      setPlaceLoading(true)
      setPlaceError(null)

      try {
        const response = await fetch(toApiUrl(`/api/places/search?q=${encodeURIComponent(query)}`), {
          signal: controller.signal,
        })

        if (!response.ok) {
          const message = await readError(response)
          throw new Error(message === 'Request failed.' ? copy.placeSearchError : message)
        }

        const payload = (await response.json()) as PlaceSuggestion[]
        setPlaceResults(payload)

        if (payload.length === 0) {
          setPlaceError(copy.placeNoResults)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setPlaceResults([])
          setPlaceError(error instanceof Error && error.message !== 'Failed to fetch' ? error.message : copy.placeSearchError)
        }
      } finally {
        setPlaceLoading(false)
      }
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [copy.placeNoResults, copy.placeSearchError, deferredQuery, selectedPlace])

  useEffect(() => {
    if (view !== 'flight') {
      return
    }

    const timer = window.setTimeout(() => {
      setView('story')
    }, prefersReducedMotion ? 120 : FLIGHT_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [view, prefersReducedMotion])

  useEffect(() => {
    if (view !== 'whiteout') {
      return
    }

    const timer = window.setTimeout(() => {
      setView('premium')
    }, prefersReducedMotion ? 120 : WHITEOUT_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [view, prefersReducedMotion])

  useEffect(() => {
    if (view !== 'story' || !chart) {
      return
    }

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })

    if (prefersReducedMotion) {
      setStorySteps([...STORY_REVEAL_ORDER])
      return
    }

    setStorySteps([])

    const delays = [200, 1200, 2200, 3200, 4300, 5400]
    const timers = delays.map((delay, index) =>
      window.setTimeout(() => {
        setStorySteps((current) => {
          const nextStep = STORY_REVEAL_ORDER[index]
          return current.includes(nextStep) ? current : [...current, nextStep]
        })
      }, delay),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [view, chart, prefersReducedMotion])

  useEffect(() => {
    if (view !== 'premium') {
      return
    }

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [view, prefersReducedMotion])

  async function loadAiAdvice(currentChart: NatalChartResult) {
    if (aiLoading || aiAdvice) {
      return
    }

    setAiLoading(true)
    setAiError(null)

    try {
      const response = await fetch(toApiUrl(AI_ROUTE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chart: currentChart,
        }),
      })

      if (!response.ok) {
        const fallbackMessage =
          response.status === 503 ? `${copy.aiUnavailableLead} (${AI_ROUTE})` : await readError(response)
        throw new Error(fallbackMessage)
      }

      const payload = (await response.json()) as AiInsightsResponse
      setAiAdvice(payload.advice?.trim() || null)
      setAiProvider(payload.provider)
    } catch (error) {
      setAiAdvice(null)
      setAiProvider(null)
      setAiError(error instanceof Error ? error.message : copy.aiUnavailableLead)
    } finally {
      setAiLoading(false)
    }
  }

  async function loadEmailPlaceholder() {
    setEmailLoading(true)
    setEmailError(null)

    try {
      const response = await fetch(toApiUrl(EMAIL_ROUTE), {
        method: 'POST',
      })

      const payload = (await response.json()) as Partial<PremiumEmailPlaceholderResponse>

      if (typeof payload.endpoint !== 'string' || typeof payload.ready !== 'boolean') {
        throw new Error(copy.emailUnavailableLead)
      }

      setEmailPlaceholder({
        ok: Boolean(payload.ok),
        ready: payload.ready,
        endpoint: payload.endpoint,
        error: payload.error || '',
      })
    } catch (error) {
      setEmailPlaceholder(null)
      setEmailError(error instanceof Error ? error.message : copy.emailUnavailableLead)
    } finally {
      setEmailLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedPlace) {
      setChartError(copy.noPlaceError)
      return
    }

    const requestStartedAt = Date.now()

    setChartLoading(true)
    setChartError(null)
    setPlaceError(null)
    setChart(null)
    setStorySteps([])
    setAiAdvice(null)
    setAiProvider(null)
    setAiError(null)
    setEmailPlaceholder(null)
    setEmailError(null)

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
        setView('flight')
      })
    } catch (error) {
      setChartError(error instanceof Error ? error.message : 'Chart generation failed.')
      setView('landing')
    } finally {
      setChartLoading(false)
    }
  }

  function resetToLanding() {
    setView('landing')
    setStorySteps([])
    setAiAdvice(null)
    setAiProvider(null)
    setAiError(null)
    setEmailPlaceholder(null)
    setEmailError(null)
    setPlaceError(null)
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  function openPremiumPage() {
    if (chart) {
      void loadAiAdvice(chart)
    }

    if (!emailPlaceholder && !emailLoading) {
      void loadEmailPlaceholder()
    }

    setView('whiteout')
  }

  const isStoryVisible = (id: StoryStepId) => storySteps.includes(id)
  const personalityOverview = chart ? buildPersonalityOverview(chart, locale) : ''
  const weeklyPulse = chart ? buildWeeklyPulse(chart, locale) : ''
  const monthlyOutlook = chart ? buildMonthlyOutlook(chart, locale) : ''
  const monthlyReminder = chart ? buildMonthlyReminder(chart, locale) : ''
  const aiBody = aiAdvice?.trim() || ''
  const storyHighlights = chart?.interpretation.highlights.slice(0, 4) ?? []
  const summaryItems = chart
    ? [
        {
          label: copy.summaryLabels.sun,
          value: getSignDisplay(chart.summary.sun.sign, chart.summary.sun.signLabel, locale),
          meta: formatDegree(chart.summary.sun.degree, locale),
        },
        {
          label: copy.summaryLabels.moon,
          value: getSignDisplay(chart.summary.moon.sign, chart.summary.moon.signLabel, locale),
          meta: formatDegree(chart.summary.moon.degree, locale),
        },
        {
          label: copy.summaryLabels.rising,
          value: getSignDisplay(chart.summary.ascendant.sign, chart.summary.ascendant.signLabel, locale),
          meta: formatDegree(chart.summary.ascendant.degree, locale),
        },
        {
          label: copy.summaryLabels.dominant,
          value: `${getElementDisplay(chart.summary.dominantElement, locale)} / ${getModalityDisplay(chart.summary.dominantModality, locale)}`,
          meta: `${chart.summary.dominantElementCount} · ${chart.summary.dominantModalityCount}`,
        },
      ]
    : []

  const storyProgress = [
    { id: 'chart', label: copy.storyProgress.chart },
    { id: 'personality', label: copy.storyProgress.personality },
    { id: 'weekly', label: copy.storyProgress.weekly },
    { id: 'monthly', label: copy.storyProgress.monthly },
    { id: 'reminder', label: copy.storyProgress.reminder },
    { id: 'premium', label: copy.storyProgress.premium },
  ] satisfies Array<{ id: StoryStepId; label: string }>

  const showTopbar = view === 'landing' || view === 'story' || view === 'premium'

  return (
    <div className={`page-shell ${view === 'premium' || view === 'whiteout' ? 'is-light' : ''}`}>
      {showTopbar && (
        <header className={`site-topbar ${view === 'premium' ? 'is-light' : ''}`}>
          <div className="brand-lockup">
            <span className="brand-mark">SCL</span>
            <div className="brand-copy">
              <span className="eyebrow">{copy.eyebrow}</span>
              <strong>{copy.brand}</strong>
            </div>
          </div>

          <div className="locale-switch" role="group" aria-label={copy.localeLabel}>
            {(['zh-TW', 'en'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={`locale-button ${locale === option ? 'is-active' : ''}`}
                onClick={() => setLocale(option)}
              >
                {copy.localeOptions[option]}
              </button>
            ))}
          </div>
        </header>
      )}

      {view === 'landing' && (
        <main className="view-panel landing-view">
          <section className="landing-shell">
            <div className="landing-copy">
              <span className="eyebrow">{copy.eyebrow}</span>
              <h1>{copy.landingTitle}</h1>
              <p className="landing-lead">{copy.landingLead}</p>

              <div className="landing-bullets">
                {copy.landingBullets.map((item) => (
                  <span key={item} className="landing-pill">
                    {item}
                  </span>
                ))}
              </div>

              <p className="landing-hint">{copy.landingHint}</p>
            </div>

            <aside className="form-panel">
              <div className="section-heading">
                <span className="section-kicker">{copy.formEyebrow}</span>
                <h2>{copy.formTitle}</h2>
                <p>{copy.formLead}</p>
              </div>

              <form className="chart-form" onSubmit={handleSubmit}>
                <div className="field-row">
                  <label className="input-field">
                    <span>{copy.dateLabel}</span>
                    <input type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} required />
                  </label>

                  <label className="input-field">
                    <span>{copy.timeLabel}</span>
                    <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
                  </label>
                </div>

                <label className="input-field">
                  <span>{copy.placeLabel}</span>
                  <input
                    type="text"
                    value={placeQuery}
                    onChange={(event) => {
                      setPlaceQuery(event.target.value)
                      setSelectedPlace(null)
                      setPlaceError(null)
                    }}
                    placeholder={copy.placePlaceholder}
                    required
                  />
                  {placeLoading && <small>{copy.placeLoading}</small>}
                  {!placeLoading && selectedPlace && (
                    <small>
                      {copy.placeSelected}: {selectedPlace.city}, {selectedPlace.country}
                    </small>
                  )}
                  {!placeLoading && !selectedPlace && placeQuery.trim().length >= 2 && !placeError && (
                    <small>{copy.placeChooseHint}</small>
                  )}
                  {!placeLoading && placeError && <small className="field-error">{placeError}</small>}
                </label>

                {placeResults.length > 0 && !selectedPlace && (
                  <div className="place-results">
                    {placeResults.map((place) => (
                      <button
                        key={place.id}
                        className="place-option"
                        type="button"
                        onClick={() => {
                          setSelectedPlace(place)
                          setPlaceQuery(place.label)
                          setPlaceResults([])
                          setPlaceError(null)
                        }}
                      >
                        <strong>{place.city}</strong>
                        <span>{place.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="form-actions">
                  <button className="primary-button" type="submit" disabled={chartLoading || !selectedPlace}>
                    {chartLoading ? copy.submitLoading : copy.submitIdle}
                  </button>
                  <p>{selectedPlace ? copy.formSubmitHint : copy.submitNeedsPlace}</p>
                  <small>{copy.accuracyHint}</small>
                </div>
              </form>

              {chartError && <p className="error-text">{chartError}</p>}
            </aside>
          </section>
        </main>
      )}

      {view === 'flight' && (
        <main className="transition-view transition-view--flight">
          <div className="transition-copy">
            <span className="eyebrow">{copy.eyebrow}</span>
            <h1>{copy.flightTitle}</h1>
            <p>{copy.flightLead}</p>
          </div>

          <div className="starfield">
            <div className="flight-vignette" />
            <div className="flight-beam" />
            <div className="star-layer star-layer--near" />
            <div className="star-layer star-layer--mid" />
            <div className="star-layer star-layer--far" />
            <div className="star-cluster" />
            <div className="flight-orb flight-orb--one" />
            <div className="flight-orb flight-orb--two" />
            <div className="flight-orb flight-orb--three" />
            <div className="flight-core" />
          </div>
        </main>
      )}

      {view === 'story' && chart && (
        <main className="view-panel story-view">
          <section className="story-shell">
            <div className="story-hero">
              <button type="button" className="secondary-button" onClick={resetToLanding}>
                {copy.storyBack}
              </button>

              <span className="eyebrow">{copy.storyEyebrow}</span>
              <h1>{copy.storyTitle}</h1>
              <p>{copy.storyLead}</p>

              <div className="meta-row">
                <span className="meta-pill">{formatLongDate(chart.input.date, locale)}</span>
                <span className="meta-pill">{chart.input.time}</span>
                <span className="meta-pill">{chart.input.placeLabel}</span>
              </div>

              {storyHighlights.length > 0 && (
                <div className="story-highlights">
                  <span className="story-highlights-label">{copy.storyHighlightsTitle}</span>
                  <div className="story-highlights-list">
                    {storyHighlights.map((item) => (
                      <span key={item} className="story-highlight-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="progress-rail">
              {storyProgress.map((item, index) => (
                <div key={item.id} className={`progress-node ${isStoryVisible(item.id) ? 'is-active' : ''}`}>
                  <span>{`0${index + 1}`}</span>
                  <strong>{item.label}</strong>
                </div>
              ))}
            </div>

            <div className="sequence-list">
              <article className={`sequence-card wheel-stage ${isStoryVisible('chart') ? 'is-visible' : ''}`}>
                <div className="card-head">
                  <span className="section-kicker">{copy.storyProgress.chart}</span>
                  <h2>{copy.chartTitle}</h2>
                  <p>{copy.chartLead}</p>
                </div>

                <div className="wheel-stage-layout">
                  <div className="wheel-glow">
                    <ChartWheel
                      houses={chart.houses}
                      planets={chart.planets}
                      ascendantDegree={chart.summary.ascendant.absDegree}
                      midheavenDegree={chart.summary.midheaven.absDegree}
                    />
                  </div>

                  <div className="summary-grid">
                    {summaryItems.map((item) => (
                      <article key={item.label} className="summary-card">
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        <p>{item.meta}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </article>

              <article className={`sequence-card text-stage ${isStoryVisible('personality') ? 'is-visible' : ''}`}>
                <div className="card-head">
                  <span className="section-kicker">{copy.storyProgress.personality}</span>
                  <h2>{copy.personalityTitle}</h2>
                </div>
                <p className="long-copy">{personalityOverview}</p>
              </article>

              <article className={`sequence-card compact-stage ${isStoryVisible('weekly') ? 'is-visible' : ''}`}>
                <div className="card-head">
                  <span className="section-kicker">{copy.storyProgress.weekly}</span>
                  <h2>{copy.weeklyTitle}</h2>
                </div>
                <p>{weeklyPulse}</p>
              </article>

              <article className={`sequence-card text-stage ${isStoryVisible('monthly') ? 'is-visible' : ''}`}>
                <div className="card-head">
                  <span className="section-kicker">{copy.storyProgress.monthly}</span>
                  <h2>{copy.monthlyTitle}</h2>
                </div>
                <p>{monthlyOutlook}</p>
              </article>

              <article className={`sequence-card compact-stage ${isStoryVisible('reminder') ? 'is-visible' : ''}`}>
                <div className="card-head">
                  <span className="section-kicker">{copy.storyProgress.reminder}</span>
                  <h2>{copy.reminderTitle}</h2>
                </div>
                <p>{monthlyReminder}</p>
              </article>

              <article className={`sequence-card unlock-stage ${isStoryVisible('premium') ? 'is-visible' : ''}`}>
                <div className="card-head">
                  <span className="section-kicker">{copy.storyProgress.premium}</span>
                  <h2>{copy.premiumTitle}</h2>
                  <p>{copy.premiumLead}</p>
                </div>

                <div className="mask-shell">
                  <div className="mask-head">
                    <strong>{copy.premiumMaskTitle}</strong>
                    <p>{copy.premiumMaskLead}</p>
                  </div>

                  <div className="mask-grid">
                    {copy.premiumMaskCards.map((card) => (
                      <article key={card.title} className="mask-card">
                        <div className="mask-cover" aria-hidden="true" />
                        <strong>{card.title}</strong>
                        <p>{card.body}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <button type="button" className="primary-button" onClick={openPremiumPage}>
                  {copy.premiumButton}
                </button>
                <small>{copy.premiumFootnote}</small>
              </article>
            </div>
          </section>
        </main>
      )}

      {view === 'whiteout' && (
        <main className="transition-view transition-view--whiteout">
          <div className="transition-copy transition-copy--light">
            <span className="eyebrow">{copy.premiumEyebrow}</span>
            <h1>{copy.premiumFlightTitle}</h1>
            <p>{copy.premiumFlightLead}</p>
          </div>

          <div className="whiteout-scene">
            <div className="whiteout-ring whiteout-ring--outer" />
            <div className="whiteout-ring whiteout-ring--inner" />
            <div className="light-seed" />
          </div>
        </main>
      )}

      {view === 'premium' && chart && (
        <main className="premium-view">
          <section className="premium-shell">
            <div className="premium-header">
              <span className="premium-kicker">{copy.premiumEyebrow}</span>
              <h1>{copy.premiumPageTitle}</h1>
              <p>{copy.premiumPageLead}</p>

              <div className="premium-meta">
                <span>{formatLongDate(chart.input.date, locale)}</span>
                <span>{chart.input.time}</span>
                <span>{chart.input.placeLabel}</span>
              </div>

              <button type="button" className="light-button" onClick={resetToLanding}>
                {copy.premiumBackHome}
              </button>
            </div>

            <div className="premium-grid">
              <article className="premium-card premium-card--intro">
                <span className="premium-inline-label">{copy.premiumIntroTitle}</span>
                <h2>{chart.interpretation.headline}</h2>
                <p>{chart.interpretation.subheadline || copy.premiumIntroLead}</p>
              </article>

              <article className="premium-card premium-card--summary">
                <h2>{copy.chartTitle}</h2>
                <div className="premium-summary-grid">
                  {summaryItems.map((item) => (
                    <article key={item.label} className="premium-summary-item">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <p>{item.meta}</p>
                    </article>
                  ))}
                </div>
              </article>

              <article className="premium-card premium-card--ai">
                <h2>{copy.aiTitle}</h2>
                <p>{copy.aiLead}</p>

                {aiLoading && <p className="premium-loading">{copy.aiLoading}</p>}

                {!aiLoading && aiBody && (
                  <div className="ai-copy ai-copy--raw">
                    {aiProvider && <span className="premium-tag">{aiProvider}</span>}
                    <pre>{aiBody}</pre>
                  </div>
                )}

                {!aiLoading && !aiBody && (
                  <div className="premium-placeholder">
                    <strong>{copy.aiUnavailableTitle}</strong>
                    <p>{aiError || copy.aiUnavailableLead}</p>
                    <code>{`${copy.aiRouteLabel}: ${AI_ROUTE}`}</code>
                  </div>
                )}
              </article>

              <article className="premium-card premium-card--sections">
                <h2>{copy.personalityTitle}</h2>
                <div className="white-section-list">
                  {chart.interpretation.sections.map((section) => (
                    <article key={section.title} className="white-section-item">
                      <strong>{section.title}</strong>
                      <p>{section.body}</p>
                    </article>
                  ))}
                </div>
              </article>

              <article className="premium-card premium-card--email">
                <h2>{copy.emailTitle}</h2>
                <p>{copy.emailLead}</p>

                {emailLoading && <p className="premium-loading">{copy.emailLoading}</p>}

                {!emailLoading && emailPlaceholder && (
                  <div className="email-status">
                    <span className={`premium-tag ${emailPlaceholder.ready ? 'is-ready' : ''}`}>
                      {emailPlaceholder.ready ? copy.emailStatusReady : copy.emailStatusPending}
                    </span>
                    <code>{`${copy.emailRouteLabel}: ${EMAIL_ROUTE}`}</code>
                    <code>{`endpoint: ${emailPlaceholder.endpoint}`}</code>
                  </div>
                )}

                {!emailLoading && !emailPlaceholder && (
                  <div className="premium-placeholder">
                    <strong>{copy.emailUnavailableTitle}</strong>
                    <p>{emailError || copy.emailUnavailableLead}</p>
                    <code>{`${copy.emailRouteLabel}: ${EMAIL_ROUTE}`}</code>
                  </div>
                )}
              </article>

              <article className="premium-card premium-card--architecture">
                <h2>{copy.architectureTitle}</h2>
                <p>{copy.architectureLead}</p>

                <div className="architecture-list">
                  {copy.architectureItems.map((item) => (
                    <article key={item.label} className="architecture-item">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </article>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
