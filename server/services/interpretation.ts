import type {
  AspectSummary,
  HousePlacement,
  InterpretationBlock,
  NatalChartInput,
  PlanetPlacement,
} from '../types.js'

const SIGN_STYLE: Record<string, { tone: string; gift: string; caution: string }> = {
  '牡羊座': {
    tone: '偏向先行動、再修正，直覺反應快。',
    gift: '敢開局、敢表態，遇到新局面通常比別人更快動起來。',
    caution: '太快下結論時，容易錯過更細的節奏。',
  },
  '金牛座': {
    tone: '偏向穩定累積，重視體感與實際成果。',
    gift: '能把抽象想法慢慢落地，耐心與持續力很夠。',
    caution: '在改變逼近時，可能會先抗拒再接受。',
  },
  '雙子座': {
    tone: '偏向資訊流動，靠觀察與連結快速吸收。',
    gift: '懂得提問、切題、轉譯，學習反應很靈活。',
    caution: '資訊一多就容易分心，能量被切得太碎。',
  },
  '巨蟹座': {
    tone: '偏向保護、感受與內在安全感。',
    gift: '對氛圍、人心與情緒變化很敏感，照顧力強。',
    caution: '一旦不安，容易先退回殼裡再觀望。',
  },
  '獅子座': {
    tone: '偏向自我表達、創造與主導氣場。',
    gift: '有舞台感，知道怎麼把存在感和熱情放大。',
    caution: '若外界反應不如預期，容易感到受挫。',
  },
  '處女座': {
    tone: '偏向整理、修正與精準拆解。',
    gift: '能看到細節誤差，擅長優化流程與品質。',
    caution: '標準拉太高時，會讓自己長期緊繃。',
  },
  '天秤座': {
    tone: '偏向關係平衡、審美與協調。',
    gift: '很會看互動張力，能替對話找到中間點。',
    caution: '若太在意平衡，決策速度會被拖慢。',
  },
  '天蠍座': {
    tone: '偏向深入、專注、看見底層動機。',
    gift: '能穿透表面，抓到真正重要的核心。',
    caution: '防衛心升高時，會把能量鎖得太緊。',
  },
  '射手座': {
    tone: '偏向擴張、探索與意義感。',
    gift: '能拉高視角，把事情放回更大的脈絡。',
    caution: '如果只顧著往前衝，容易忽略現場限制。',
  },
  '摩羯座': {
    tone: '偏向結構、目標與長線經營。',
    gift: '能扛責任、建秩序，知道怎麼讓事情站穩。',
    caution: '若壓力累積太久，會讓自己變得過度克制。',
  },
  '水瓶座': {
    tone: '偏向獨立、系統思考與打破慣性。',
    gift: '很會看到不同做法，適合重新定義規則。',
    caution: '抽離過頭時，會讓人覺得不易靠近。',
  },
  '雙魚座': {
    tone: '偏向感應、包容與想像流動。',
    gift: '直覺細膩，能把抽象感受轉成共鳴。',
    caution: '邊界不夠清楚時，容易被情境帶著走。',
  },
}

const HOUSE_TOPICS: Record<number, string> = {
  1: '自我呈現與第一印象',
  2: '價值感、金錢與資源',
  3: '學習、表達與日常溝通',
  4: '家庭、安全感與根基',
  5: '創造力、戀愛與玩心',
  6: '工作節奏、健康與細節管理',
  7: '伴侶、合作與鏡像關係',
  8: '深層連結、共享資源與轉化',
  9: '信念、視野與遠行',
  10: '志業、位置與社會角色',
  11: '社群、願景與未來連結',
  12: '內在世界、休息與潛意識',
}

const ELEMENT_GUIDE: Record<string, string> = {
  Fire: '火元素偏強，代表你處理人生時常先點火、先嘗試、先把能量拋出去。',
  Earth: '土元素偏強，代表你重視落地、秩序與可以長期累積的東西。',
  Air: '風元素偏強，代表你靠思考、交流與觀念切換來推動自己。',
  Water: '水元素偏強，代表你做決定時很容易先從感受與安全感出發。',
}

const MODE_GUIDE: Record<string, string> = {
  Cardinal: '基本宮偏強，表示你擅長發動局面，容易成為事情的起點。',
  Fixed: '固定宮偏強，表示你有黏著度與穩定性，能把方向守住。',
  Mutable: '變動宮偏強，表示你適應力高，懂得在變化中調整方法。',
}

const ASPECT_GUIDE: Record<string, string> = {
  conjunction: '把兩股力量綁在一起，效果很集中。',
  opposition: '把課題推到對立面，逼你在拉扯中找到平衡。',
  trine: '流動順，天生容易上手。',
  square: '摩擦感強，會逼出成長與行動。',
  sextile: '有合作空間，只要主動就能打開。',
}

function describePlanet(planet: PlanetPlacement) {
  const signStyle = SIGN_STYLE[planet.signLabel]
  const houseTopic = HOUSE_TOPICS[planet.house]

  return `${planet.label}落在${planet.signLabel}、${planet.houseLabel}，主題集中在${houseTopic}。${signStyle.tone}${signStyle.gift}`
}

function buildAspectSection(aspects: AspectSummary[]) {
  const picks = aspects
    .filter((aspect) =>
      ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant', 'Midheaven'].includes(
        aspect.planet1,
      ),
    )
    .slice(0, 3)

  if (picks.length === 0) {
    return '這張盤面沒有特別突出的緊密相位，整體節奏比較平均，適合先從太陽、月亮與上升的三大主軸去理解。'
  }

  return picks
    .map((aspect) => {
      const meaning = ASPECT_GUIDE[aspect.aspect] || '代表這兩個主題之間有明顯互動。'
      return `${aspect.planet1} 與 ${aspect.planet2} 形成 ${aspect.aspect}，容許度約 ${aspect.orb.toFixed(2)} 度，${meaning}`
    })
    .join(' ')
}

export function buildInterpretation({
  input,
  summary,
  planets,
  aspects,
}: {
  input: NatalChartInput
  summary: {
    sun: PlanetPlacement
    moon: PlanetPlacement
    ascendant: { signLabel: string }
    dominantElement: string
    dominantModality: string
  }
  planets: PlanetPlacement[]
  houses: HousePlacement[]
  aspects: AspectSummary[]
}) {
  const ascStyle = SIGN_STYLE[summary.ascendant.signLabel]
  const sunStyle = SIGN_STYLE[summary.sun.signLabel]
  const moonStyle = SIGN_STYLE[summary.moon.signLabel]
  const mercury = planets.find((planet) => planet.key === 'mercury')
  const venus = planets.find((planet) => planet.key === 'venus')
  const mars = planets.find((planet) => planet.key === 'mars')

  const sections: InterpretationBlock[] = [
    {
      title: '人格主軸',
      body: `${input.placeLabel} 的這張本命盤，以 ${summary.sun.signLabel} 太陽作為核心底色。${sunStyle.tone}${describePlanet(summary.sun)} ${sunStyle.caution}`,
    },
    {
      title: '情緒節奏',
      body: `${summary.moon.signLabel} 月亮說明你如何消化情緒與尋找安全感。${moonStyle.tone}${describePlanet(summary.moon)} ${moonStyle.caution}`,
    },
    {
      title: '對外氣場',
      body: `上升落在${summary.ascendant.signLabel}，別人第一次感受到的通常是你「${ascStyle.tone.replace('偏向', '')}」的那一面。這會影響你怎麼開場、怎麼被記住，也會影響別人願不願意靠近你。`,
    },
    {
      title: '盤面結構',
      body: `${ELEMENT_GUIDE[summary.dominantElement] || ''}${MODE_GUIDE[summary.dominantModality] || ''}`.trim(),
    },
    {
      title: '相位提醒',
      body: buildAspectSection(aspects),
    },
  ]

  const highlights = [
    `${summary.sun.signLabel} 太陽在 ${summary.sun.houseLabel}`,
    `${summary.moon.signLabel} 月亮在 ${summary.moon.houseLabel}`,
    `${summary.ascendant.signLabel} 上升作為你的外在入口`,
  ]

  if (mercury) {
    highlights.push(`${mercury.signLabel} 水星讓你以 ${HOUSE_TOPICS[mercury.house]} 的方式思考`)
  }

  if (venus) {
    highlights.push(`${venus.signLabel} 金星讓你在關係與審美上偏向 ${venus.houseLabel} 的主題`)
  }

  if (mars) {
    highlights.push(`${mars.signLabel} 火星代表你行動時會把力氣丟進 ${mars.houseLabel}`)
  }

  return {
    headline: `${summary.sun.signLabel} 太陽、${summary.moon.signLabel} 月亮、${summary.ascendant.signLabel} 上升`,
    subheadline: '先看三大主軸，再用元素、宮位與相位把輪廓補完整。',
    keywords: [summary.sun.signLabel, summary.moon.signLabel, summary.ascendant.signLabel, summary.dominantElement, summary.dominantModality],
    highlights: highlights.slice(0, 5),
    sections,
  }
}
