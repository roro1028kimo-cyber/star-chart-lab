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
  return (
    <main className="view-panel landing-view">
      <section className="landing-shell">
        <div className="landing-copy">
          <div className="landing-atmosphere" aria-hidden="true">
            <div className="landing-nebula landing-nebula--gold" />
            <div className="landing-nebula landing-nebula--blue" />
            <div className="landing-starfield" />
            <div className="landing-gridplane" />
            <div className="landing-orbit-system">
              <span className="landing-orbit landing-orbit--outer" />
              <span className="landing-orbit landing-orbit--middle" />
              <span className="landing-orbit landing-orbit--inner" />
              <span className="landing-core" />
              <span className="landing-satellite landing-satellite--one" />
              <span className="landing-satellite landing-satellite--two" />
            </div>
            <div className="landing-signal landing-signal--one" />
            <div className="landing-signal landing-signal--two" />
          </div>

          <div className="landing-copy-inner">
            <span className="eyebrow">{APP_COPY.landingEyebrow}</span>

            <div className="landing-title-group">
              <h1>
                {APP_COPY.landingTitleLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p className="landing-lead">{APP_COPY.landingLead}</p>
            </div>

            <div className="landing-points">
              {APP_COPY.landingPoints.map((item) => (
                <span key={item} className="landing-pill">
                  {item}
                </span>
              ))}
            </div>

            <p className="landing-hint">{APP_COPY.landingHint}</p>
          </div>

          <small className="landing-brand-signature">{APP_COPY.landingBrandSignature}</small>
        </div>

        <aside className="form-panel">
          <div className="section-heading">
            <span className="section-kicker">{APP_COPY.formKicker}</span>
            <h2>{APP_COPY.formTitle}</h2>
            <p>{APP_COPY.formLead}</p>
          </div>

          <form className="chart-form" onSubmit={onSubmit}>
            <div className="field-row">
              <label className="input-field">
                <span>{APP_COPY.dateLabel}</span>
                <input type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} required />
              </label>

              <label className="input-field">
                <span>{APP_COPY.timeLabel}</span>
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
              </label>
            </div>

            <label className="input-field">
              <span>{APP_COPY.placeLabel}</span>
              <input
                type="text"
                value={placeQuery}
                onChange={(event) => onPlaceQueryChange(event.target.value)}
                placeholder={APP_COPY.placePlaceholder}
                required
              />
              {placeLoading && <small>{APP_COPY.placeLoading}</small>}
              {!placeLoading && selectedPlace && (
                <small>
                  {APP_COPY.placeSelected}：{selectedPlace.city}, {selectedPlace.country}
                </small>
              )}
              {!placeLoading && !selectedPlace && placeQuery.trim().length >= 2 && !placeError && (
                <small>{APP_COPY.placeChooseHint}</small>
              )}
              {!placeLoading && placeError && <small className="field-error">{placeError}</small>}
            </label>

            {placeResults.length > 0 && !selectedPlace && (
              <div className="place-results">
                {placeResults.map((place) => (
                  <button key={place.id} className="place-option" type="button" onClick={() => onSelectPlace(place)}>
                    <strong>{place.city}</strong>
                    <span>{place.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={chartLoading || !selectedPlace}>
                {chartLoading ? APP_COPY.submitLoading : APP_COPY.submitIdle}
              </button>
              <p>{selectedPlace ? APP_COPY.accuracyHint : APP_COPY.submitNeedsPlace}</p>
            </div>
          </form>

          {chartError && <p className="error-text">{chartError}</p>}
        </aside>
      </section>
    </main>
  )
}
