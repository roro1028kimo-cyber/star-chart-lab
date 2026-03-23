import type { AspectSummary, InterpretationBlock, NatalChartInput, PlanetPlacement } from '../types.js'

type SignProfile = {
  name: string
  core: string
  emotion: string
  relationship: string
  work: string
  shadow: string
}

const SIGN_PROFILES: Record<string, SignProfile> = {
  Ari: {
    name: '牡羊座',
    core: '先動再說，行動感就是安全感',
    emotion: '情緒來得快也退得快，不喜歡被拖住節奏',
    relationship: '喜歡直接、坦白、有火花的互動',
    work: '適合開路、啟動新局、帶頭衝刺',
    shadow: '壓力大時容易在還沒被否定前先把自己點燃',
  },
  Tau: {
    name: '金牛座',
    core: '重視穩定、可控感與真實可摸到的成果',
    emotion: '需要時間確認安全，確認之後就很難輕易抽離',
    relationship: '一旦投入就很持久，也很重視身體與生活感',
    work: '擅長把抽象想法做成可落地的節奏',
    shadow: '太久不動時，容易把壓力悶成固執',
  },
  Gem: {
    name: '雙子座',
    core: '靠資訊、對話與變化保持活性',
    emotion: '需要被理解，而不是被急著定義',
    relationship: '喜歡好聊、有反應、願意交換想法的人',
    work: '擅長表達、串聯、轉譯與快速切換',
    shadow: '容易讓腦袋跑得比情緒還快',
  },
  Can: {
    name: '巨蟹座',
    core: '先感受氣氛，再決定自己要不要靠近',
    emotion: '需要被接住，也很容易先照顧別人',
    relationship: '保護欲強，重視家感與熟悉感',
    work: '擅長建立歸屬感、照顧流程與接住情緒',
    shadow: '受傷時會退回殼裡，不一定會把真正原因講出來',
  },
  Leo: {
    name: '獅子座',
    core: '需要被看見自己的光，也願意為重視的人發光',
    emotion: '真心對待，也真心在意回應',
    relationship: '愛得大方，討厭曖昧和含糊不清',
    work: '擅長帶頭、呈現、凝聚注意力',
    shadow: '怕被忽略時容易過度用力證明自己',
  },
  Vir: {
    name: '處女座',
    core: '先整理、先修正，心裡才會真正放鬆',
    emotion: '對細節很敏感，常默默記住很多事',
    relationship: '愛是照顧、是幫你把事情做好',
    work: '擅長優化、修補、建立可靠流程',
    shadow: '容易把壓力轉成自我苛責',
  },
  Lib: {
    name: '天秤座',
    core: '重視平衡、審美與互相尊重',
    emotion: '需要關係裡的和諧，也在意彼此是否對等',
    relationship: '懂得合作、協調，也很怕粗暴失衡',
    work: '擅長包裝、整合、讓人願意靠近',
    shadow: '怕衝突時，容易延後真正表態',
  },
  Sco: {
    name: '天蠍座',
    core: '要就全要，不然寧可不開始',
    emotion: '敏感、深刻，也很在意信任感',
    relationship: '追求深度、忠誠與不能被敷衍的連結',
    work: '擅長洞察隱性動機、切入核心問題',
    shadow: '怕失控時，會先測試對方或先築牆',
  },
  Sag: {
    name: '射手座',
    core: '需要空間、真相與更大的可能',
    emotion: '不喜歡被綁死，也不喜歡虛假氣氛',
    relationship: '喜歡一起成長、一起遠行的人',
    work: '擅長打開視野、點燃熱情與帶出方向感',
    shadow: '壓力大時會用自由包裝逃避',
  },
  Cap: {
    name: '摩羯座',
    core: '先扛起責任，才允許自己放鬆',
    emotion: '安全感常來自成果、紀律與掌控感',
    relationship: '慢熱但可靠，會用長期行動證明在乎',
    work: '擅長規劃、管理、長期布局',
    shadow: '容易把脆弱藏太深，讓人以為你什麼都不需要',
  },
  Aqu: {
    name: '水瓶座',
    core: '先看結構與全局，再決定要不要靠近',
    emotion: '需要思想空間，也需要邊界被尊重',
    relationship: '重視平等、自由與有腦的交流',
    work: '擅長系統、創新、社群與新觀點',
    shadow: '太理性時，會把感受切得太遠',
  },
  Pis: {
    name: '雙魚座',
    core: '界線柔軟，感受很深，也很容易先接住別人的情緒',
    emotion: '需要被理解，也需要安靜把情緒沉澱下來',
    relationship: '有同理、有想像力，但也容易過度投射',
    work: '擅長想像、療癒、藝術與細緻感受',
    shadow: '累的時候容易躲進幻想或延後面對',
  },
}

const ELEMENT_OPENINGS: Record<string, string> = {
  Fire: '你不是沒有野心，你只是討厭把野心講得太廉價。',
  Earth: '你不是慢，你只是比別人更在意失控的代價。',
  Air: '你不是想太多，你是比別人更早看見風向變了。',
  Water: '你不是太敏感，你是太早感受到場裡真正的情緒。',
}

const MODE_CLOSINGS: Record<string, string> = {
  Cardinal: '現在真正的課題，不是再衝更快，而是先把方向定清楚。',
  Fixed: '現在真正的課題，不是更用力，而是願意鬆動早就不合身的防備。',
  Mutable: '現在真正的課題，不是再找更多選項，而是替自己留下一個穩定節奏。',
}

const ELEMENT_GUIDE: Record<string, string> = {
  Fire: '火象偏強，代表你的人生推進力很旺。你一旦確認方向，就不喜歡被拖慢，也不喜歡情緒卡在半空。',
  Earth: '土象偏強，代表你最怕的是沒有根。你需要可驗證的成果、可依靠的節奏，才能真正放鬆下來。',
  Air: '風象偏強，代表你是靠觀察、思考與交流在前進的人。資訊一亂，心也會跟著飄。',
  Water: '水象偏強，代表你對情緒與氣氛非常敏感。真正影響你的，往往不是表面事件，而是沒有說破的暗流。',
}

const MODE_GUIDE: Record<string, string> = {
  Cardinal: '本位能量偏強，說明你很會啟動事情，也常常是最先感覺到「不能再這樣下去」的人。',
  Fixed: '固定能量偏強，說明你一旦認定，就很能撐住局面；但同時也更需要學會鬆開那些已經過期的堅持。',
  Mutable: '變動能量偏強，說明你很能調整、很能適應，但也容易在太多可能性裡分散力氣。',
}

const HOUSE_THEMES: Record<number, string> = {
  1: '自我呈現與出場方式',
  2: '價值感、金錢與安全感',
  3: '表達、學習與日常互動',
  4: '家庭、根源與內在安定',
  5: '創造力、戀愛與自我展現',
  6: '工作節奏、習慣與日常維護',
  7: '伴侶、合作與一對一關係',
  8: '親密、界線與深層轉化',
  9: '信念、遠方與人生觀',
  10: '事業、名聲與社會定位',
  11: '朋友、社群與未來藍圖',
  12: '潛意識、修復與隱藏情緒',
}

const ASPECT_GUIDE: Record<string, string> = {
  conjunction: '這組能量黏得很近，優勢是集中，代價是很難假裝不受影響。',
  opposition: '這組能量像在拉扯你，常讓你在兩種需求之間來回擺盪。',
  trine: '這組能量流動順，通常是你很自然就會的天賦。',
  square: '這組能量有摩擦感，會逼你長出方法，而不是只靠天分。',
  sextile: '這組能量像是偏門助力，只要願意練，會越來越好用。',
}

function getSignProfile(sign: string) {
  return SIGN_PROFILES[sign] || SIGN_PROFILES.Ari
}

function getHouseTheme(house: number) {
  return HOUSE_THEMES[house] || '你的重要生活課題'
}

function buildFreeReading(summary: {
  sun: PlanetPlacement
  moon: PlanetPlacement
  ascendant: { sign: string; signLabel: string }
  dominantElement: string
  dominantModality: string
}) {
  const sun = getSignProfile(summary.sun.sign)
  const moon = getSignProfile(summary.moon.sign)
  const rising = getSignProfile(summary.ascendant.sign)

  return [
    ELEMENT_OPENINGS[summary.dominantElement] || '你不是沒有感覺，你只是比別人更早察覺真正的重量。',
    `太陽在${sun.name}、月亮在${moon.name}、上升在${rising.name}，讓你外表看起來偏向${rising.core}；真正推著你往前走的，常常是「${moon.emotion}」這份內在需求，和「${sun.core}」這股核心推進力同時在拉。`,
    MODE_CLOSINGS[summary.dominantModality] || '你現在最需要的，不是更多答案，而是先替自己保留能穩穩前進的節奏。',
  ].join('\n\n')
}

function describeClosestAspect(aspects: AspectSummary[]) {
  const closest = [...aspects].sort((left, right) => left.orb - right.orb)[0]

  if (!closest) {
    return '目前這張盤最明顯的提醒，不是外在事件，而是你該怎麼調整自己的節奏與邊界。'
  }

  const meaning = ASPECT_GUIDE[closest.aspect] || '這組能量值得你多觀察它平常怎麼影響你的判斷。'
  return `${closest.planet1} 與 ${closest.planet2} 的 ${closest.aspect} 相位特別近，${meaning}`
}

function buildCoreSection(summary: {
  sun: PlanetPlacement
  moon: PlanetPlacement
  ascendant: { sign: string; signLabel: string }
}) {
  const sun = getSignProfile(summary.sun.sign)
  const moon = getSignProfile(summary.moon.sign)
  const rising = getSignProfile(summary.ascendant.sign)

  return {
    title: '你真正的底色',
    body: `你給人的第一印象，常常帶著${rising.name}那種「${rising.core}」的味道，所以別人會先感覺到你的保留、你的節奏，或你不想被輕易定義的那一面。可是你真正的決策核心，是${sun.name}對於「${sun.work}」的渴望；而在情緒底層，${moon.name}又一直提醒你要先確認感受有沒有被安放。這代表你不是單一人格，而是外在出場、內在感受、核心決策三股力量一起運作。當它們不同步時，你會覺得自己一下想衝、一下想退；當你願意承認兩種需求都是真的，反而會更穩。`,
  }
}

function buildRelationshipSection(planets: PlanetPlacement[], summary: { moon: PlanetPlacement }) {
  const moon = getSignProfile(summary.moon.sign)
  const venus = planets.find((planet) => planet.key === 'venus')
  const venusProfile = venus ? getSignProfile(venus.sign) : moon

  return {
    title: '你怎麼靠近愛',
    body: `在關係裡，你不是只看感覺，也不是只看條件；你真正要的是一種「能不能安心做自己」的感覺。${moon.name}讓你情緒上特別在意${moon.emotion}，所以對方如果只回應表面、卻沒有碰到你真正的在意點，你會立刻把心收回來。${venusProfile.name}的愛情模式，則讓你更傾向${venusProfile.relationship}。這代表你要的不是熱鬧陪伴，而是有來有往、有誠意、有一致性的互動。你一旦認真投入，就不是玩玩而已；真正的課題，是在深情之前，先把邊界說清楚。`,
  }
}

function buildWorkSection(planets: PlanetPlacement[], summary: {
  sun: PlanetPlacement
  midheaven: { sign: string; signLabel: string }
}) {
  const sun = getSignProfile(summary.sun.sign)
  const mars = planets.find((planet) => planet.key === 'mars')
  const marsProfile = mars ? getSignProfile(mars.sign) : sun
  const midheaven = getSignProfile(summary.midheaven.sign)

  return {
    title: '你怎麼發光',
    body: `你的工作力，不只是會不會做事，而是你如何把自己推進到對的位置。${sun.name}會讓你想在自己的專長上被看見，${marsProfile.name}則決定你出手的節奏與戰鬥方式。這也讓你在工作上特別適合${sun.work}，同時又會用${marsProfile.work}的方式把事情推進。至於事業形象，${midheaven.name}會讓你更容易在外界留下「${midheaven.work}」的印象。你真正的優勢不是拚命，而是當你把節奏抓回自己手上時，會比很多人更知道什麼值得長期投入。`,
  }
}

function buildGrowthSection(
  summary: {
    dominantElement: string
    dominantModality: string
    sun: PlanetPlacement
    moon: PlanetPlacement
  },
  aspects: AspectSummary[],
) {
  const sunTheme = getHouseTheme(summary.sun.house)
  const moonTheme = getHouseTheme(summary.moon.house)

  return {
    title: '你現在最該學會的事',
    body: `${ELEMENT_GUIDE[summary.dominantElement] || ''}${MODE_GUIDE[summary.dominantModality] || ''} 這也說明你最近最需要整理的，不只是效率，而是你的內在分配。太陽所在的${sunTheme}提醒你要把主導權拿回來；月亮所在的${moonTheme}則提醒你，情緒不是雜訊，而是導航。${describeClosestAspect(aspects)} 如果你一直逼自己只靠硬撐往前，會越走越乾；如果你願意承認自己真正的消耗點，很多卡住的地方反而會開始鬆動。`,
  }
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
    ascendant: { sign: string; signLabel: string }
    midheaven: { sign: string; signLabel: string }
    dominantElement: string
    dominantModality: string
  }
  planets: PlanetPlacement[]
  aspects: AspectSummary[]
}) {
  const sun = getSignProfile(summary.sun.sign)
  const moon = getSignProfile(summary.moon.sign)
  const rising = getSignProfile(summary.ascendant.sign)

  const sections: InterpretationBlock[] = [
    buildCoreSection(summary),
    buildRelationshipSection(planets, summary),
    buildWorkSection(planets, summary),
    buildGrowthSection(summary, aspects),
  ]

  return {
    headline: `${sun.name}太陽 × ${moon.name}月亮 × ${rising.name}上升`,
    subheadline: `你在 ${input.placeLabel} 打開的這張盤，先透露了你的核心性格、情感慣性，以及最近最該面對的成長課題。`,
    keywords: [sun.name, moon.name, rising.name, summary.dominantElement, summary.dominantModality],
    highlights: [
      `${sun.name}太陽落在${summary.sun.houseLabel}`,
      `${moon.name}月亮落在${summary.moon.houseLabel}`,
      `${rising.name}上升決定第一印象`,
      `${summary.dominantElement}元素與${summary.dominantModality}模式偏強`,
    ],
    freeReading: buildFreeReading(summary),
    premiumTeaser: '如果你願意往下，下一頁會把你在愛裡怎麼靠近、在工作裡怎麼發光、又在哪裡最容易卡住，慢慢說給你聽。',
    sections,
  }
}
