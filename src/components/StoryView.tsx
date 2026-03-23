import { APP_COPY, formatLongDate, formatPlacementDegree, getElementDisplay, getModalityDisplay } from '../content'
import type { NatalChartResult } from '../types'
import { ChartWheel } from './ChartWheel'
import { PlacementTable } from './PlacementTable'

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
      meta: `${chart.summary.sun.houseLabel} · ${formatPlacementDegree(
        chart.summary.sun.formattedDegree,
        chart.summary.sun.degree,
      )}`,
    },
    {
      label: APP_COPY.summaryLabels.moon,
      value: chart.summary.moon.signLabel,
      meta: `${chart.summary.moon.houseLabel} · ${formatPlacementDegree(
        chart.summary.moon.formattedDegree,
        chart.summary.moon.degree,
      )}`,
    },
    {
      label: APP_COPY.summaryLabels.rising,
      value: chart.summary.ascendant.signLabel,
      meta: formatPlacementDegree(chart.summary.ascendant.formattedDegree, chart.summary.ascendant.degree),
    },
    {
      label: APP_COPY.summaryLabels.dominant,
      value: `${getElementDisplay(chart.summary.dominantElement)} / ${getModalityDisplay(chart.summary.dominantModality)}`,
      meta: `${chart.summary.dominantElementCount} 顆偏向此元素 · ${chart.summary.dominantModalityCount} 顆偏向此模式`,
    },
  ]

  return (
    <main className="view-panel story-view">
      <section className="story-shell">
        <div className="story-hero">
          <button type="button" className="secondary-button" onClick={onReset}>
            {APP_COPY.storyBack}
          </button>
          <span className="eyebrow">首輪短讀</span>
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
              <span className="section-kicker">星盤核心</span>
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
              <span className="section-kicker">短讀開場</span>
              <h2>{APP_COPY.freeReadingTitle}</h2>
              <p>{APP_COPY.freeReadingLead}</p>
            </div>
            <pre className="free-reading">{chart.interpretation.freeReading}</pre>
          </article>

          <article className="story-card story-card--unlock">
            <div className="card-head">
              <span className="section-kicker">往下展開</span>
              <h2>{APP_COPY.unlockTitle}</h2>
              <p>{APP_COPY.unlockLead}</p>
            </div>

            <button type="button" className="primary-button" onClick={onOpenPremium}>
              {APP_COPY.unlockButton}
            </button>
            <p>{chart.interpretation.premiumTeaser}</p>
            <small>{APP_COPY.unlockFootnote}</small>
          </article>

          <article className="story-card story-card--placement">
            <div className="card-head">
              <span className="section-kicker">星體落點</span>
              <h2>{APP_COPY.placementTitle}</h2>
              <p>{APP_COPY.placementLead}</p>
            </div>
            <PlacementTable chart={chart} />
          </article>

          <article className="story-card story-card--highlights">
            <div className="card-head">
              <span className="section-kicker">第一批訊號</span>
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
        </div>
      </section>
    </main>
  )
}
