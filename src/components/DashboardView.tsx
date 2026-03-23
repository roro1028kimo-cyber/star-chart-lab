import {
  APP_COPY,
  formatLongDate,
  formatPlacementDegree,
  getElementDisplay,
  getModalityDisplay,
  getTaiwanWeekRangeLabel,
  getTaiwanYear,
} from '../content'
import type { DashboardSection, ForecastResponse, NatalChartResult } from '../types'
import { ChartWheel } from './ChartWheel'
import { PlacementTable } from './PlacementTable'

type SidebarItem =
  | { kind: 'section'; key: DashboardSection; label: string; hint: string }
  | { kind: 'route'; key: 'tarot'; label: string; hint: string }

function buildHouseCards(chart: NatalChartResult) {
  return chart.houses.map((house) => {
    const occupants = chart.planets.filter((planet) => planet.house === house.number)

    return {
      key: house.number,
      title: `${house.number}宮`,
      sign: house.signLabel,
      degree: formatPlacementDegree(house.formattedDegree, house.degree),
      occupants: occupants.length > 0 ? occupants.map((planet) => planet.label).join('、') : '目前沒有主要星體落入',
    }
  })
}

function buildSummaryItems(chart: NatalChartResult) {
  return [
    {
      label: APP_COPY.summaryLabels.sun,
      value: chart.summary.sun.signLabel,
      meta: `${chart.summary.sun.houseLabel} · ${formatPlacementDegree(chart.summary.sun.formattedDegree, chart.summary.sun.degree)}`,
    },
    {
      label: APP_COPY.summaryLabels.moon,
      value: chart.summary.moon.signLabel,
      meta: `${chart.summary.moon.houseLabel} · ${formatPlacementDegree(chart.summary.moon.formattedDegree, chart.summary.moon.degree)}`,
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
}

export function DashboardView({
  activeSection,
  chart,
  onBackHome,
  onOpenPremium,
  onOpenTarot,
  onSelectSection,
  onRetryWeeklyForecast,
  onRetryYearlyForecast,
  vipUnlocked,
  weeklyForecast,
  weeklyForecastError,
  weeklyForecastLoading,
  yearlyForecast,
  yearlyForecastError,
  yearlyForecastLoading,
}: {
  activeSection: DashboardSection
  chart: NatalChartResult
  onBackHome: () => void
  onOpenPremium: () => void
  onOpenTarot: () => void
  onSelectSection: (section: DashboardSection) => void
  onRetryWeeklyForecast: () => void
  onRetryYearlyForecast: () => void
  vipUnlocked: boolean
  weeklyForecast: ForecastResponse | null
  weeklyForecastError: string | null
  weeklyForecastLoading: boolean
  yearlyForecast: ForecastResponse | null
  yearlyForecastError: string | null
  yearlyForecastLoading: boolean
}) {
  const currentYear = getTaiwanYear()
  const weekRange = getTaiwanWeekRangeLabel()
  const summaryItems = buildSummaryItems(chart)
  const houseCards = buildHouseCards(chart)

  function renderForecastPanel({
    forecast,
    error,
    loading,
    onRetry,
    title,
    lead,
  }: {
    forecast: ForecastResponse | null
    error: string | null
    loading: boolean
    onRetry: () => void
    title: string
    lead: string
  }) {
    if (loading) {
      return (
        <div className="dashboard-copy-block">
          <p>{lead}</p>
          <p>正在向後端安全代理請求內容，API key 只會留在 server 端，不會進到前端。</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="vip-lock-panel">
          <p>{error}</p>
          <button type="button" className="secondary-button" onClick={onRetry}>
            重新取得 {title}
          </button>
        </div>
      )
    }

    if (!forecast) {
      return (
        <div className="dashboard-copy-block">
          <p>{lead}</p>
        </div>
      )
    }

    return (
      <>
        <div className="dashboard-copy-block">
          <p>{forecast.summary}</p>
          <p>{forecast.body}</p>
        </div>

        <div className="highlight-list">
          {forecast.bullets.map((item) => (
            <span key={item} className="highlight-pill">
              {item}
            </span>
          ))}
        </div>

        <small className="dashboard-meta-note">
          生成時間：{forecast.generatedAt} · 來源：{forecast.source} · {forecast.stored ? '已記錄資料庫' : '目前尚未寫入資料庫'}
        </small>
      </>
    )
  }

  const sidebarItems: SidebarItem[] = [
    {
      kind: 'section',
      key: 'yearly',
      label: `${currentYear}今年預測`,
      hint: '每年自動更新並寫入資料庫',
    },
    {
      kind: 'section',
      key: 'weekly',
      label: `本周(${weekRange})運勢分析`,
      hint: '每週自動更新並寫入資料庫',
    },
    {
      kind: 'section',
      key: 'houses',
      label: '各宮位影響範圍',
      hint: '看 12 宮落點與重心',
    },
    {
      kind: 'section',
      key: 'settings',
      label: '個人設定',
      hint: '出生資料與來源設定',
    },
    {
      kind: 'section',
      key: 'vip',
      label: 'VIP等級',
      hint: vipUnlocked ? '已解鎖完整閱讀' : '可打開完整閱讀',
    },
    {
      kind: 'route',
      key: 'tarot',
      label: '隨機塔羅牌分析',
      hint: '另開新的塔羅頁面',
    },
  ]

  function renderSectionContent() {
    if (activeSection === 'yearly') {
      return (
        <article className="dashboard-focus-card">
          <div className="card-head">
            <span className="section-kicker">年度主題</span>
            <h2>{yearlyForecast?.title || `${currentYear} 今年預測`}</h2>
            <p>這一區已直接走後端 API 生成，金鑰只會放在 server env，不會出現在前端。</p>
          </div>

          {renderForecastPanel({
            forecast: yearlyForecast,
            error: yearlyForecastError,
            loading: yearlyForecastLoading,
            onRetry: onRetryYearlyForecast,
            title: '年度預測',
            lead: '年度預測正在生成中。',
          })}
        </article>
      )
    }

    if (activeSection === 'weekly') {
      return (
        <article className="dashboard-focus-card">
          <div className="card-head">
            <span className="section-kicker">本周焦點</span>
            <h2>{weeklyForecast?.title || `本周(${weekRange})運勢分析`}</h2>
            <p>這一區已直接走後端 API 生成，之後可再接每週自動排程。</p>
          </div>

          {renderForecastPanel({
            forecast: weeklyForecast,
            error: weeklyForecastError,
            loading: weeklyForecastLoading,
            onRetry: onRetryWeeklyForecast,
            title: '本周運勢',
            lead: '本周運勢正在生成中。',
          })}
        </article>
      )
    }

    if (activeSection === 'houses') {
      return (
        <article className="dashboard-focus-card">
          <div className="card-head">
            <span className="section-kicker">宮位影響</span>
            <h2>各宮位影響範圍</h2>
            <p>先看 12 宮分佈，再往下對照星體落點。這一區會是之後做進階宮位分析的基礎。</p>
          </div>

          <div className="house-impact-grid">
            {houseCards.map((house) => (
              <article key={house.key} className="house-impact-card">
                <strong>{house.title}</strong>
                <span>{house.sign}</span>
                <p>{house.degree}</p>
                <small>{house.occupants}</small>
              </article>
            ))}
          </div>

          <PlacementTable chart={chart} />
        </article>
      )
    }

    if (activeSection === 'settings') {
      return (
        <article className="dashboard-focus-card">
          <div className="card-head">
            <span className="section-kicker">個人設定</span>
            <h2>個人設定</h2>
            <p>這裡先放出生資料、資料來源與目前帳號等級的前端顯示骨架，之後再接真正的會員資料。</p>
          </div>

          <div className="settings-list">
            <article className="settings-item">
              <span>出生日期</span>
              <strong>{formatLongDate(chart.input.date)}</strong>
            </article>
            <article className="settings-item">
              <span>出生時間</span>
              <strong>{chart.input.time}</strong>
            </article>
            <article className="settings-item">
              <span>出生地</span>
              <strong>{chart.input.placeLabel}</strong>
            </article>
            <article className="settings-item">
              <span>星盤引擎</span>
              <strong>{chart.source.engine}</strong>
            </article>
            <article className="settings-item">
              <span>地點資料</span>
              <strong>{chart.source.geocoding}</strong>
            </article>
            <article className="settings-item">
              <span>AI 狀態</span>
              <strong>{chart.source.aiConfigured ? `已配置 ${chart.source.aiProvider}` : '目前未啟用'}</strong>
            </article>
          </div>
        </article>
      )
    }

    return (
      <article className="dashboard-focus-card">
        <div className="card-head">
          <span className="section-kicker">VIP等級</span>
          <h2>VIP 等級</h2>
          <p>這裡會是完整閱讀、升級狀態與後續會員權益的主面板。</p>
        </div>

        {!vipUnlocked && (
          <div className="vip-lock-panel">
            <p>{chart.interpretation.premiumTeaser}</p>
            <button type="button" className="primary-button" onClick={onOpenPremium}>
              {APP_COPY.unlockButton}
            </button>
          </div>
        )}

        {vipUnlocked && (
          <div className="premium-section-list">
            {chart.interpretation.sections.map((section) => (
              <article key={section.title} className="premium-section-item">
                <strong>{section.title}</strong>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        )}
      </article>
    )
  }

  return (
    <main className="view-panel dashboard-view">
      <section className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar__brand">
            <span className="eyebrow">{APP_COPY.eyebrow}</span>
            <strong>{APP_COPY.brand}</strong>
          </div>

          <nav className="dashboard-nav" aria-label="主功能">
            {sidebarItems.map((item) =>
              item.kind === 'section' ? (
                <button
                  key={item.key}
                  type="button"
                  className={`dashboard-nav__button ${activeSection === item.key ? 'is-active' : ''}`}
                  onClick={() => onSelectSection(item.key)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ) : (
                <button key={item.key} type="button" className="dashboard-nav__button" onClick={onOpenTarot}>
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ),
            )}
          </nav>

          <button type="button" className="secondary-button dashboard-sidebar__home" onClick={onBackHome}>
            回到首頁
          </button>
        </aside>

        <section className="dashboard-main">
          <header className="dashboard-header">
            <span className="eyebrow">Charts Workspace</span>
            <h1>{chart.interpretation.headline}</h1>
            <p>{chart.interpretation.subheadline}</p>

            <div className="meta-row">
              <span className="meta-pill">{formatLongDate(chart.input.date)}</span>
              <span className="meta-pill">{chart.input.time}</span>
              <span className="meta-pill">{chart.input.placeLabel}</span>
            </div>
          </header>

          <div className="dashboard-stage">
            <article className="dashboard-stage__chart">
              <div className="card-head">
                <span className="section-kicker">主工作區</span>
                <h2>本命盤中心</h2>
                <p>這裡先固定保留主星盤，未來再往上疊更多互動控制。</p>
              </div>

              <div className="dashboard-stage__layout">
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

            <article className="dashboard-stage__reading">
              <div className="card-head">
                <span className="section-kicker">短讀摘要</span>
                <h2>{APP_COPY.freeReadingTitle}</h2>
                <p>{APP_COPY.freeReadingLead}</p>
              </div>
              <pre className="free-reading">{chart.interpretation.freeReading}</pre>
            </article>

            {renderSectionContent()}
          </div>
        </section>

        <aside className="dashboard-rail">
          <article className="dashboard-rail__card">
            <span className="section-kicker">年度更新</span>
            <h3>{currentYear}今年預測</h3>
            <p>{yearlyForecast?.summary || yearlyForecastError || '等待年度預測生成中。'}</p>
          </article>

          <article className="dashboard-rail__card">
            <span className="section-kicker">每周更新</span>
            <h3>本周({weekRange})</h3>
            <p>{weeklyForecast?.summary || weeklyForecastError || '等待本周運勢生成中。'}</p>
          </article>

          <article className="dashboard-rail__card">
            <span className="section-kicker">VIP 狀態</span>
            <h3>{vipUnlocked ? '已打開完整閱讀' : '尚未打開 VIP 閱讀'}</h3>
            <p>{vipUnlocked ? '你現在看到的是完整段落版位，後續可以接會員與權益資訊。' : chart.interpretation.premiumTeaser}</p>
            {!vipUnlocked && (
              <button type="button" className="secondary-button" onClick={onOpenPremium}>
                {APP_COPY.unlockButton}
              </button>
            )}
          </article>

          <article className="dashboard-rail__card">
            <span className="section-kicker">目前星盤</span>
            <h3>{chart.summary.ascendant.signLabel} 上升</h3>
            <p>
              太陽 {chart.summary.sun.signLabel} · 月亮 {chart.summary.moon.signLabel} · 主能量{' '}
              {getElementDisplay(chart.summary.dominantElement)}
            </p>
          </article>
        </aside>
      </section>
    </main>
  )
}
