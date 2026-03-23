import { APP_COPY, formatDegree, formatLongDate, getElementDisplay, getModalityDisplay } from '../content'
import type { NatalChartResult } from '../types'
import { ChartWheel } from './ChartWheel'

export function StoryView({
  chart,
  onOpenPremium,
  onReset,
}: {
  chart: NatalChartResult
  onOpenPremium: () => void
  onReset: () => void
}) {
  const summaryItems = [
    {
      label: APP_COPY.summaryLabels.sun,
      value: chart.summary.sun.signLabel,
      meta: `${chart.summary.sun.houseLabel} · ${formatDegree(chart.summary.sun.degree)}`,
    },
    {
      label: APP_COPY.summaryLabels.moon,
      value: chart.summary.moon.signLabel,
      meta: `${chart.summary.moon.houseLabel} · ${formatDegree(chart.summary.moon.degree)}`,
    },
    {
      label: APP_COPY.summaryLabels.rising,
      value: chart.summary.ascendant.signLabel,
      meta: formatDegree(chart.summary.ascendant.degree),
    },
    {
      label: APP_COPY.summaryLabels.dominant,
      value: `${getElementDisplay(chart.summary.dominantElement)} / ${getModalityDisplay(chart.summary.dominantModality)}`,
      meta: `${chart.summary.dominantElementCount} 顆主行星 / ${chart.summary.dominantModalityCount} 種模式`,
    },
  ]

  return (
    <main className="view-panel story-view">
      <section className="story-shell">
        <div className="story-hero">
          <button type="button" className="secondary-button" onClick={onReset}>
            {APP_COPY.storyBack}
          </button>
          <span className="eyebrow">First Reading</span>
          <h1>{APP_COPY.storyTitle}</h1>
          <p>{APP_COPY.storyLead}</p>

          <div className="meta-row">
            <span className="meta-pill">{formatLongDate(chart.input.date)}</span>
            <span className="meta-pill">{chart.input.time}</span>
            <span className="meta-pill">{chart.input.placeLabel}</span>
          </div>
        </div>

        <div className="story-grid">
          <article className="story-card story-card--chart">
            <div className="card-head">
              <span className="section-kicker">Natal Wheel</span>
              <h2>{APP_COPY.summaryTitle}</h2>
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

          <article className="story-card story-card--reading">
            <div className="card-head">
              <span className="section-kicker">Short Reading</span>
              <h2>{APP_COPY.freeReadingTitle}</h2>
              <p>{APP_COPY.freeReadingLead}</p>
            </div>
            <pre className="free-reading">{chart.interpretation.freeReading}</pre>
          </article>

          <article className="story-card story-card--highlights">
            <div className="card-head">
              <span className="section-kicker">Highlights</span>
              <h2>{APP_COPY.highlightsTitle}</h2>
            </div>
            <div className="highlight-list">
              {chart.interpretation.highlights.map((item) => (
                <span key={item} className="highlight-pill">
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="story-card story-card--unlock">
            <div className="card-head">
              <span className="section-kicker">Premium Gate</span>
              <h2>{APP_COPY.unlockTitle}</h2>
              <p>{chart.interpretation.premiumTeaser}</p>
            </div>

            <button type="button" className="primary-button" onClick={onOpenPremium}>
              {APP_COPY.unlockButton}
            </button>
            <small>{APP_COPY.unlockFootnote}</small>
          </article>
        </div>
      </section>
    </main>
  )
}
