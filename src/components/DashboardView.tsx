import {
  APP_COPY,
  formatLongDate,
  formatPlacementDegree,
  getElementDisplay,
  getModalityDisplay,
  getTaiwanWeekRangeLabel,
  getTaiwanYear,
} from '../content'
import type { DashboardSection, ForecastHistoryEntry, ForecastResponse, NatalChartResult } from '../types'
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
      title: `第 ${house.number} 宮`,
      sign: house.signLabel,
      degree: formatPlacementDegree(house.formattedDegree, house.degree),
      occupants: occupants.length > 0 ? occupants.map((planet) => planet.label).join('、') : '目前沒有主要星體落在這一宮',
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
      meta: `${chart.summary.dominantElementCount} 顆偏向主元素 · ${chart.summary.dominantModalityCount} 顆偏向主模式`,
    },
  ]
}

function renderHistoryBlock({
  history,
  loading,
  error,
  emptyLabel,
}: {
  history: ForecastHistoryEntry[]
  loading: boolean
  error: string | null
  emptyLabel: string
}) {
  if (loading) {
    return <p className="forecast-history__empty">正在整理你先前的版本紀錄…</p>
  }

  if (error) {
    return <p className="forecast-history__empty">{error}</p>
  }

  if (history.length === 0) {
    return <p className="forecast-history__empty">{emptyLabel}</p>
  }

  return (
    <div className="forecast-history__list">
      {history.map((entry) => (
        <article key={entry.id} className="forecast-history__card">
          <div className="forecast-history__head">
            <strong>{entry.title}</strong>
            <span>{entry.periodKey}</span>
          </div>
          <p>{entry.summary}</p>
          <small>
            {new Date(entry.generatedAt).toLocaleString('zh-TW')} · {entry.source}
          </small>
        </article>
      ))}
    </div>
  )
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
  weeklyHistory,
  weeklyHistoryError,
  weeklyHistoryLoading,
  yearlyForecast,
  yearlyForecastError,
  yearlyForecastLoading,
  yearlyHistory,
  yearlyHistoryError,
  yearlyHistoryLoading,
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
  weeklyHistory: ForecastHistoryEntry[]
  weeklyHistoryError: string | null
  weeklyHistoryLoading: boolean
  yearlyForecast: ForecastResponse | null
  yearlyForecastError: string | null
  yearlyForecastLoading: boolean
  yearlyHistory: ForecastHistoryEntry[]
  yearlyHistoryError: string | null
  yearlyHistoryLoading: boolean
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
          <p>系統正在透過安全的 server API 生成內容，金鑰不會落在前端。</p>
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
          生成時間：{new Date(forecast.generatedAt).toLocaleString('zh-TW')} · 來源：{forecast.source} ·
          {forecast.stored ? ' 已寫入資料庫' : ' 尚未寫入資料庫'}
        </small>
      </>
    )
  }

  const sidebarItems: SidebarItem[] = [
    {
      kind: 'section',
      key: 'yearly',
      label: `${currentYear} 今年預測`,
      hint: '每年生成一次，並保留資料庫紀錄',
    },
    {
      kind: 'section',
      key: 'weekly',
      label: `本週(${weekRange})運勢分析`,
      hint: '每週更新一次，會自動補產新版本',
    },
    {
      kind: 'section',
      key: 'houses',
      label: '各宮位影響範圍',
      hint: '把 12 宮的重點一次看清楚',
    },
    {
      kind: 'section',
      key: 'settings',
      label: '個人設定',
      hint: '確認出生資料與系統來源',
    },
    {
      kind: 'section',
      key: 'vip',
      label: 'VIP 等級',
      hint: vipUnlocked ? '已解鎖完整深度閱讀' : '還沒解鎖完整內容',
    },
    {
      kind: 'route',
      key: 'tarot',
      label: '隨機塔羅牌分析',
      hint: '切到獨立頁面體驗塔羅',
    },
  ]

  function renderSectionContent() {
    if (activeSection === 'yearly') {
      return (
        <article className="dashboard-focus-card">
          <div className="card-head">
            <span className="section-kicker">年度預測</span>
            <h2>{yearlyForecast?.title || `${currentYear} 今年預測`}</h2>
            <p>先把你今年最值得留意的節奏抓出來，讓你一眼就知道哪裡值得用力，哪裡先別急。</p>
          </div>

          {renderForecastPanel({
            forecast: yearlyForecast,
            error: yearlyForecastError,
            loading: yearlyForecastLoading,
            onRetry: onRetryYearlyForecast,
            title: '年度預測',
            lead: '年度預測正在整理中，稍後就會把重點帶到你眼前。',
          })}

          <section className="forecast-history">
            <div className="forecast-history__title">
              <strong>歷史版本</strong>
              <span>這張星盤曾經生成過的年度紀錄都會留在資料庫裡。</span>
            </div>
            {renderHistoryBlock({
              history: yearlyHistory,
              loading: yearlyHistoryLoading,
              error: yearlyHistoryError,
              emptyLabel: '目前還只有這一版，之後年度更新會在這裡累積。',
            })}
          </section>
        </article>
      )
    }

    if (activeSection === 'weekly') {
      return (
        <article className="dashboard-focus-card">
          <div className="card-head">
            <span className="section-kicker">本週運勢</span>
            <h2>{weeklyForecast?.title || `本週(${weekRange})運勢分析`}</h2>
            <p>這裡不是流水帳，而是把你這週真正該注意的情緒節點、行動節奏和互動提醒抓出來。</p>
          </div>

          {renderForecastPanel({
            forecast: weeklyForecast,
            error: weeklyForecastError,
            loading: weeklyForecastLoading,
            onRetry: onRetryWeeklyForecast,
            title: '本週運勢',
            lead: '本週運勢正在整理中，會很快把這一週的主節奏送上來。',
          })}

          <section className="forecast-history">
            <div className="forecast-history__title">
              <strong>歷史版本</strong>
              <span>這裡會保留你過去幾週的版本，方便對照節奏怎麼變。</span>
            </div>
            {renderHistoryBlock({
              history: weeklyHistory,
              loading: weeklyHistoryLoading,
              error: weeklyHistoryError,
              emptyLabel: '目前還沒有舊週報，等下一次週期更新後就會看到。',
            })}
          </section>
        </article>
      )
    }

    if (activeSection === 'houses') {
      return (
        <article className="dashboard-focus-card">
          <div className="card-head">
            <span className="section-kicker">宮位影響</span>
            <h2>各宮位影響範圍</h2>
            <p>把 12 宮當成你人生不同場景的聚光燈，哪裡比較亮、哪裡比較安靜，這裡會很直觀。</p>
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
            <p>這裡先幫你確認資料來源，之後如果要接帳號、VIP 等級或更多偏好設定，也會從這裡延伸。</p>
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
              <span>出生地點</span>
              <strong>{chart.input.placeLabel}</strong>
            </article>
            <article className="settings-item">
              <span>星盤引擎</span>
              <strong>{chart.source.engine}</strong>
            </article>
            <article className="settings-item">
              <span>地點來源</span>
              <strong>{chart.source.geocoding}</strong>
            </article>
            <article className="settings-item">
              <span>AI 狀態</span>
              <strong>{chart.source.aiConfigured ? `已啟用 ${chart.source.aiProvider}` : '尚未啟用 AI'}</strong>
            </article>
          </div>
        </article>
      )
    }

    return (
      <article className="dashboard-focus-card">
        <div className="card-head">
          <span className="section-kicker">VIP 等級</span>
          <h2>VIP 等級</h2>
          <p>如果免費內容是在幫你打開門，完整閱讀就是把房間裡真正重要的內容一盞一盞點亮。</p>
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

          <nav className="dashboard-nav" aria-label="Dashboard navigation">
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
                <span className="section-kicker">命盤中心</span>
                <h2>你的本命盤</h2>
                <p>主舞台先把星盤本體放中間，右邊再幫你快速讀懂主元素、太陽、月亮和上升。</p>
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
                <span className="section-kicker">免費短讀</span>
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
            <span className="section-kicker">年度摘要</span>
            <h3>{currentYear} 今年預測</h3>
            <p>{yearlyForecast?.summary || yearlyForecastError || '年度預測正在生成中。'}</p>
          </article>

          <article className="dashboard-rail__card">
            <span className="section-kicker">本週摘要</span>
            <h3>本週({weekRange})</h3>
            <p>{weeklyForecast?.summary || weeklyForecastError || '本週運勢正在生成中。'}</p>
          </article>

          <article className="dashboard-rail__card">
            <span className="section-kicker">VIP 狀態</span>
            <h3>{vipUnlocked ? '已解鎖完整閱讀' : '還沒打開 VIP'}</h3>
            <p>{vipUnlocked ? '你現在可以直接往下看更完整、更細緻的深度段落。' : chart.interpretation.premiumTeaser}</p>
            {!vipUnlocked && (
              <button type="button" className="secondary-button" onClick={onOpenPremium}>
                {APP_COPY.unlockButton}
              </button>
            )}
          </article>

          <article className="dashboard-rail__card">
            <span className="section-kicker">命盤輪廓</span>
            <h3>{chart.summary.ascendant.signLabel} 上升</h3>
            <p>
              太陽 {chart.summary.sun.signLabel} · 月亮 {chart.summary.moon.signLabel} · 主元素{' '}
              {getElementDisplay(chart.summary.dominantElement)}
            </p>
          </article>
        </aside>
      </section>
    </main>
  )
}
