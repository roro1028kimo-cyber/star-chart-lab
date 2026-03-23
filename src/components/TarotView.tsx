import { useState } from 'react'
import type { NatalChartResult } from '../types'

const TAROT_CARDS = [
  {
    name: '愚者',
    light: '新的開始正在靠近，你現在需要的是勇氣，不是把所有答案先想完。',
    shadow: '別因為太想立刻翻篇，就忽略了眼前其實還有該看清的細節。',
  },
  {
    name: '女祭司',
    light: '這張牌提醒你先安靜下來，很多答案其實早就藏在你的直覺裡。',
    shadow: '如果你一直只聽外面的聲音，會越來越聽不到自己真正想要什麼。',
  },
  {
    name: '皇后',
    light: '現在最重要的不是逼自己更硬，而是讓資源、關係和能量慢慢長出來。',
    shadow: '當你一直在照顧所有人時，也別忘了你自己也需要被滋養。',
  },
  {
    name: '戰車',
    light: '你其實已經準備好往前了，接下來要做的是把方向抓穩，不要分心。',
    shadow: '如果只是一直衝，卻沒有對齊真正目標，很快就會覺得累。',
  },
  {
    name: '力量',
    light: '你現在的課題不是硬撐，而是用更穩的方式把情緒和能量收回來。',
    shadow: '越想證明自己沒事，有時反而越容易讓真正的疲累被忽略。',
  },
  {
    name: '星星',
    light: '這是一張很適合重新校準期待的牌，你正在慢慢回到真正相信的方向。',
    shadow: '別把希望只放在遠方，也要記得今天可以先做的小步驟。',
  },
] as const

function pickCard() {
  return TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)]
}

export function TarotView({
  chart,
  onBackDashboard,
  onBackHome,
}: {
  chart: NatalChartResult
  onBackDashboard: () => void
  onBackHome: () => void
}) {
  const [card, setCard] = useState(() => pickCard())

  function drawAgain() {
    setCard(pickCard())
  }

  return (
    <main className="view-panel tarot-view">
      <section className="tarot-shell">
        <header className="tarot-header">
          <div className="tarot-actions">
            <button type="button" className="secondary-button" onClick={onBackDashboard}>
              回到中控台
            </button>
            <button type="button" className="secondary-button" onClick={onBackHome}>
              回到首頁
            </button>
          </div>

          <span className="eyebrow">Tarot Portal</span>
          <h1>隨機塔羅牌分析</h1>
          <p>這頁先把塔羅體驗獨立出來。魔法陣目前先用前端圖形占位，之後可以再替換成你要的正式素材版本。</p>
        </header>

        <div className="tarot-layout">
          <article className="tarot-stage">
            <div className="tarot-circle" aria-hidden="true">
              <span className="tarot-circle__ring tarot-circle__ring--outer" />
              <span className="tarot-circle__ring tarot-circle__ring--middle" />
              <span className="tarot-circle__ring tarot-circle__ring--inner" />
              <span className="tarot-circle__core" />
            </div>

            <div className="tarot-card">
              <span className="section-kicker">抽到的牌</span>
              <h2>{card.name}</h2>
              <p>{card.light}</p>
              <small>{card.shadow}</small>

              <button type="button" className="primary-button" onClick={drawAgain}>
                再抽一張
              </button>
            </div>
          </article>

          <aside className="tarot-sidebar">
            <article className="tarot-sidebar__card">
              <span className="section-kicker">目前對照</span>
              <h3>{chart.interpretation.headline}</h3>
              <p>這一頁之後可以把塔羅抽牌結果和你的本命盤內容一起對照，做成更完整的情境解讀。</p>
            </article>

            <article className="tarot-sidebar__card">
              <span className="section-kicker">後續規劃</span>
              <h3>素材與資料流</h3>
              <p>下一段可以再補魔法陣正式素材、抽牌紀錄、牌陣規則和寫入資料庫的流程。</p>
            </article>
          </aside>
        </div>
      </section>
    </main>
  )
}
