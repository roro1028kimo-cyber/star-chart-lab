import { APP_COPY, formatDegree, formatLongDate, getElementDisplay, getModalityDisplay } from '../content'
import type { NatalChartResult } from '../types'
import { ChartWheel } from './ChartWheel'

export function PremiumView({
  chart,
  onBackHome,
  onBackStory,
}: {
  chart: NatalChartResult
  onBackHome: () => void
  onBackStory: () => void
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
      meta: `${chart.summary.dominantElementCount} 顆主行星 · ${chart.summary.dominantModalityCount} 種模式`,
    },
  ]

  return (
    <main className="premium-view">
      <section className="premium-shell">
        <div className="premium-header">
          <span className="premium-kicker">{APP_COPY.premiumBadge}</span>
          <h1>{APP_COPY.premiumTitle}</h1>
          <p>{APP_COPY.premiumLead}</p>

          <div className="premium-meta">
            <span>{formatLongDate(chart.input.date)}</span>
            <span>{chart.input.time}</span>
            <span>{chart.input.placeLabel}</span>
          </div>

          <div className="premium-actions">
            <button type="button" className="secondary-button secondary-button--light" onClick={onBackStory}>
              {APP_COPY.premiumBackStory}
            </button>
            <button type="button" className="light-button" onClick={onBackHome}>
              {APP_COPY.premiumBackHome}
            </button>
          </div>
        </div>

        <div className="premium-grid">
          <article className="premium-card premium-card--intro">
            <span className="premium-inline-label">開場</span>
            <h2>{chart.interpretation.headline}</h2>
            <p>{chart.interpretation.subheadline}</p>
          </article>

          <article className="premium-card premium-card--chart">
            <div className="card-head">
              <span className="section-kicker">星盤快照</span>
              <h2>{APP_COPY.summaryTitle}</h2>
            </div>

            <div className="premium-chart-layout">
              <div className="wheel-glow wheel-glow--light">
                <ChartWheel
                  houses={chart.houses}
                  planets={chart.planets}
                  ascendantDegree={chart.summary.ascendant.absDegree}
                  midheavenDegree={chart.summary.midheaven.absDegree}
                />
              </div>

              <div className="premium-summary-grid">
                {summaryItems.map((item) => (
                  <article key={item.label} className="premium-summary-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <p>{item.meta}</p>
                  </article>
                ))}
              </div>
            </div>
          </article>

          <article className="premium-card premium-card--sidebar">
            <div className="card-head">
              <span className="section-kicker">這份閱讀</span>
              <h2>{APP_COPY.premiumSidebarTitle}</h2>
            </div>

            <div className="sidebar-list">
              {APP_COPY.premiumSidebarItems.map((item) => (
                <span key={item} className="sidebar-pill">
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="premium-card premium-card--sections">
            <div className="card-head">
              <span className="section-kicker">完整長讀</span>
              <h2>{APP_COPY.premiumSectionsTitle}</h2>
            </div>

            <div className="premium-section-list">
              {chart.interpretation.sections.map((section) => (
                <article key={section.title} className="premium-section-item">
                  <strong>{section.title}</strong>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
