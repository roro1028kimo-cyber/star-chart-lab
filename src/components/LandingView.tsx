import type { FormEvent } from 'react'
import { APP_COPY } from '../content'
import type { PlaceSuggestion } from '../types'

export function LandingView({
  chartError,
  chartLoading,
  date,
  onPlaceQueryChange,
  onSelectPlace,
  onSubmit,
  placeError,
  placeLoading,
  placeQuery,
  placeResults,
  selectedPlace,
  setDate,
  setTime,
  time,
  today,
}: {
  chartError: string | null
  chartLoading: boolean
  date: string
  onPlaceQueryChange: (value: string) => void
  onSelectPlace: (place: PlaceSuggestion) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  placeError: string | null
  placeLoading: boolean
  placeQuery: string
  placeResults: PlaceSuggestion[]
  selectedPlace: PlaceSuggestion | null
  setDate: (value: string) => void
  setTime: (value: string) => void
  time: string
  today: string
}) {
  const placeStatus = placeLoading
    ? APP_COPY.placeLoading
    : selectedPlace
      ? `${APP_COPY.placeSelected}: ${selectedPlace.city}, ${selectedPlace.country}`
      : placeQuery.trim().length >= 2 && !placeError
        ? APP_COPY.placeChooseHint
        : null

  return (
    <main id="top" className="view-panel landing-v2">
      <div className="landing-v2__backdrop" aria-hidden="true">
        <div className="landing-v2__backdrop-image" />
        <div className="landing-v2__backdrop-veil" />
        <div className="landing-v2__starfield" />
      </div>

      <div className="landing-v2__shell">
        <nav className="landing-v2__nav" aria-label="Primary">
          <a className="landing-v2__brand" href="#top">
            <span className="landing-v2__brand-mark" />
            <span>{APP_COPY.brand}</span>
          </a>

          <div className="landing-v2__menu">
            <a href="#chart-form">{APP_COPY.formTitle}</a>
            <a href="#feature-strip">{APP_COPY.highlightsTitle}</a>
            <a href="#feature-strip">{APP_COPY.unlockTitle}</a>
          </div>

          <div className="landing-v2__actions">
            <a className="landing-v2__link-button" href="#feature-strip">
              Dashboard
            </a>
            <a className="landing-v2__cta-button" href="#chart-form">
              {APP_COPY.submitIdle}
            </a>
          </div>
        </nav>

        <section className="landing-v2__hero">
          <div className="landing-v2__copy">
            <div className="landing-v2__badge">
              <span className="landing-v2__badge-dot" />
              <span>{APP_COPY.eyebrow}</span>
            </div>

            <div className="landing-v2__headline-group">
              <h1>
                {APP_COPY.landingTitleLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p>{APP_COPY.landingLead}</p>
            </div>

            <div className="landing-v2__pill-row">
              {APP_COPY.landingPoints.map((item) => (
                <span key={item} className="landing-v2__pill">
                  {item}
                </span>
              ))}
            </div>

            <form id="chart-form" className="landing-v2__form-card" onSubmit={onSubmit}>
              <div className="landing-v2__form-grid">
                <label className="landing-v2__field">
                  <span>{APP_COPY.dateLabel}</span>
                  <div className="landing-v2__input-shell">
                    <span className="landing-v2__field-icon">D</span>
                    <input type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} required />
                  </div>
                </label>

                <label className="landing-v2__field">
                  <span>{APP_COPY.timeLabel}</span>
                  <div className="landing-v2__input-shell">
                    <span className="landing-v2__field-icon">T</span>
                    <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
                  </div>
                </label>
              </div>

              <label className="landing-v2__field">
                <span>{APP_COPY.placeLabel}</span>
                <div className="landing-v2__input-shell">
                  <span className="landing-v2__field-icon">P</span>
                  <input
                    type="text"
                    value={placeQuery}
                    onChange={(event) => onPlaceQueryChange(event.target.value)}
                    placeholder={APP_COPY.placePlaceholder}
                    required
                  />
                </div>
              </label>

              {placeStatus && <p className="landing-v2__helper">{placeStatus}</p>}
              {placeError && <p className="landing-v2__helper landing-v2__helper--error">{placeError}</p>}

              {placeResults.length > 0 && !selectedPlace && (
                <div className="landing-v2__results">
                  {placeResults.map((place) => (
                    <button
                      key={place.id}
                      className="landing-v2__result"
                      type="button"
                      onClick={() => onSelectPlace(place)}
                    >
                      <strong>{place.city}</strong>
                      <span>{place.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="landing-v2__form-actions">
                <button className="landing-v2__submit" type="submit" disabled={chartLoading || !selectedPlace}>
                  <span>{chartLoading ? APP_COPY.submitLoading : APP_COPY.submitIdle}</span>
                  <span aria-hidden="true">{'->'}</span>
                </button>
                <p>{selectedPlace ? APP_COPY.accuracyHint : APP_COPY.submitNeedsPlace}</p>
              </div>
            </form>

            {chartError && <p className="landing-v2__error">{chartError}</p>}

            <div className="landing-v2__trust-row">
              <span>Private and secure flow</span>
              <span>Rule-based reading first</span>
              <span>Readable natal dossier</span>
            </div>
          </div>

          <div className="landing-v2__visual" aria-hidden="true">
            <div className="landing-v2__visual-glow" />
            <div className="landing-v2__ring landing-v2__ring--outer" />
            <div className="landing-v2__ring landing-v2__ring--middle" />
            <div className="landing-v2__ring landing-v2__ring--inner" />
            <div className="landing-v2__segments">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="landing-v2__core">
              <span />
            </div>

            <div className="landing-v2__marker landing-v2__marker--top">SUN</div>
            <div className="landing-v2__marker landing-v2__marker--right">ASC</div>
            <div className="landing-v2__marker landing-v2__marker--bottom">MOON</div>
            <div className="landing-v2__marker landing-v2__marker--left">MC</div>

            <div className="landing-v2__info-card landing-v2__info-card--left">
              <span>Moon Sign</span>
              <strong>Scorpio 14deg</strong>
            </div>

            <div className="landing-v2__info-card landing-v2__info-card--right">
              <span>Ascendant</span>
              <strong>Leo 22deg</strong>
            </div>
          </div>
        </section>

        <section id="feature-strip" className="landing-v2__feature-strip">
          <article className="landing-v2__feature-card">
            <span>01</span>
            <strong>Exact natal chart pipeline</strong>
            <p>從出生資料輸入到命盤結果，首頁直接接回現有 natal chart API。</p>
          </article>

          <article className="landing-v2__feature-card">
            <span>02</span>
            <strong>Place search stays connected</strong>
            <p>地點搜尋、選取地點、提示訊息與錯誤處理都保留在新首頁裡。</p>
          </article>

          <article className="landing-v2__feature-card">
            <span>03</span>
            <strong>Premium-ready experience</strong>
            <p>視覺改成更高質感的首頁，但不會切斷後續 dashboard、forecast 與 premium 動線。</p>
          </article>
        </section>
      </div>
    </main>
  )
}
