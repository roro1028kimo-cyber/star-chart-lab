import type { AspectSummary, InterpretationBlock, NatalChartInput, PlanetPlacement } from '../types.js'

type SignProfile = {
  name: string
  vibe: string
  heart: string
  love: string
  work: string
  growth: string
}

const SIGN_PROFILES: Record<string, SignProfile> = {
  Ari: {
    name: '牡羊座',
    vibe: '你很容易先動起來，直覺快、反應快，也不喜歡把熱情拖到變冷。',
    heart: '情緒一來很真，開心就很亮，不舒服也很難假裝沒事。',
    love: '你喜歡有火花、有來有往的關係，不想把愛談成例行公事。',
    work: '你做事帶衝勁，適合需要開路、需要先出手的場景。',
    growth: '你要學的不是壓住自己，而是把衝勁放進更穩的節奏裡。',
  },
  Tau: {
    name: '金牛座',
    vibe: '你給人的感覺穩、沉著，會先觀察，再決定要不要真的投入。',
    heart: '你需要安全感，也很重視生活是否真的讓自己舒服。',
    love: '你在關係裡不愛花招，更在意對方是不是能長久地讓你安心。',
    work: '你適合把事情做紮實，慢慢累積成別人追不上的厚度。',
    growth: '你要學的是在穩定裡保留彈性，而不是把自己鎖在原地。',
  },
  Gem: {
    name: '雙子座',
    vibe: '你反應快、腦袋靈活，總能很快抓到現場氣氛和重點。',
    heart: '你的情緒常跟想法連在一起，理解之後才比較能放鬆。',
    love: '你需要會聊天、能交流的人，沒有交流的關係很快就會乾掉。',
    work: '你適合資訊流動快、需要溝通與轉譯能力的位置。',
    growth: '你要學的是把分散的靈感收攏成真正能落地的選擇。',
  },
  Can: {
    name: '巨蟹座',
    vibe: '你很會感受氣氛，常常在別人開口前就知道對方哪裡不對勁。',
    heart: '你的情緒有深度，也很需要被理解和被接住。',
    love: '你談感情不是玩票，你要的是願意一起照顧彼此的人。',
    work: '你適合能照顧人、能培養關係、能慢慢建立信任的環境。',
    growth: '你要學的是先照顧自己，再去照顧所有你在乎的人。',
  },
  Leo: {
    name: '獅子座',
    vibe: '你有存在感，也很自然會想把自己最亮的部分拿出來。',
    heart: '你需要被看見、被重視，情感表達通常真誠又直接。',
    love: '你在關係裡很願意給，但也希望對方是真心珍惜你的光。',
    work: '你適合站到前面帶氣氛、定方向，或做出有辨識度的成果。',
    growth: '你要學的是把自信和自尊分開，讓力量更穩，而不是更硬。',
  },
  Vir: {
    name: '處女座',
    vibe: '你觀察細，對細節有感，常常很快就能看到哪裡可以更好。',
    heart: '你的情緒處理通常帶著分析，想清楚了，心才比較安。',
    love: '你在關係裡很在意可靠度，也會用照顧和實際行動表達喜歡。',
    work: '你很適合整理流程、優化細節，把混亂變成可用的秩序。',
    growth: '你要學的是放過那些不需要完美的地方，讓自己輕一點。',
  },
  Lib: {
    name: '天秤座',
    vibe: '你擅長感受互動的平衡，很自然會想讓關係和場面變得順。',
    heart: '你不太喜歡太粗暴的情緒，通常會先找一個好一點的表達方式。',
    love: '你想要的是好好相處的愛，既有美感，也有彼此尊重。',
    work: '你擅長協調、整合與對齊不同角色，很適合做橋樑。',
    growth: '你要學的是在顧及別人之前，也清楚站穩自己的位置。',
  },
  Sco: {
    name: '天蠍座',
    vibe: '你外表不一定張揚，但內在很深，認真起來會投入得非常徹底。',
    heart: '你對情緒很敏感，也很難接受表面話或半真半假的關係。',
    love: '你要的是深度和真心，不是只有熱鬧和陪伴感而已。',
    work: '你適合研究、洞察、拆解問題核心，或在壓力下處理難題。',
    growth: '你要學的是把控制感慢慢換成信任，不然很容易一直繃著。',
  },
  Sag: {
    name: '射手座',
    vibe: '你身上有一股想往前、想看更遠的勁，不太喜歡被困住。',
    heart: '你的情緒需要出口，需要空間，也需要相信事情還有可能性。',
    love: '你喜歡真誠又有生命力的關係，討厭彼此把對方越管越小。',
    work: '你適合能探索、能擴張、能把眼界帶進工作裡的舞台。',
    growth: '你要學的是自由不是逃走，而是知道自己為什麼選擇留下。',
  },
  Cap: {
    name: '摩羯座',
    vibe: '你會先看現實條件，也很知道一件事要做到位需要多少功夫。',
    heart: '你不一定馬上表露情緒，但其實感受很深，只是更克制。',
    love: '你在關係裡重承諾，真正要你心安的，是對方的穩與真。',
    work: '你有耐力、有責任感，適合把長期目標一步一步做出來。',
    growth: '你要學的是成就很重要，但你自己也值得被溫柔對待。',
  },
  Aqu: {
    name: '水瓶座',
    vibe: '你有自己的想法，不太喜歡被套進別人早就寫好的答案裡。',
    heart: '你需要心理空間，也需要能讓你做自己的人際關係。',
    love: '你要的關係很重同頻感，能聊、能懂、能尊重彼此差異。',
    work: '你適合創新、整合新觀點，或把舊框架換成新的做法。',
    growth: '你要學的是保留獨立，也練習更放心地讓人靠近。',
  },
  Pis: {
    name: '雙魚座',
    vibe: '你感受細膩，很容易接住情緒、氛圍與那些說不出口的東西。',
    heart: '你有很強的共感力，也因此需要界線，才不會一直被拖著走。',
    love: '你在關係裡很有包容力，但真正適合你的愛也要能反過來保護你。',
    work: '你適合把感受力、想像力和理解力變成作品、陪伴或創造。',
    growth: '你要學的是相信溫柔可以有邊界，不必每次都把自己交出去。',
  },
}

const ELEMENT_LABELS: Record<string, string> = {
  Fire: '火象',
  Earth: '土象',
  Air: '風象',
  Water: '水象',
}

const MODALITY_LABELS: Record<string, string> = {
  Cardinal: '本位',
  Fixed: '固定',
  Mutable: '變動',
}

const ELEMENT_OPENINGS: Record<string, string> = {
  Fire: '整張盤先給人的感覺很有火，像是心裡一直有一個想往前的引擎。',
  Earth: '整張盤的節奏偏穩，你不是只想想，而是會慢慢把事情做成。',
  Air: '整張盤帶著很強的思考和交流感，很多事情你都會先從理解開始。',
  Water: '整張盤的情緒感受力很高，你不是冷冷看世界的人，而是真的會被觸動。',
}

const MODALITY_GUIDE: Record<string, string> = {
  Cardinal: '你習慣先開場、先帶頭，很多事不是被推著走，而是你自己先動起來。',
  Fixed: '你一旦認定就很穩，優點是可靠，課題是別讓自己卡在太緊的執著裡。',
  Mutable: '你很能調整，也很懂看局勢，真正的力量在於把彈性變成方向感。',
}

const HOUSE_THEMES: Record<number, string> = {
  1: '你如何出現在世界面前',
  2: '你的價值感與安全感',
  3: '你的思考、表達與日常交流',
  4: '你的內在、家庭與情感基地',
  5: '你的創造力、戀愛感與玩心',
  6: '你的工作節奏、習慣與照顧方式',
  7: '你如何進入關係與合作',
  8: '你面對深度、信任與轉化的方式',
  9: '你看世界、學習與擴張自己的方式',
  10: '你的志向、位置與社會形象',
  11: '你的朋友圈、願景與未來感',
  12: '你的潛意識、修復與內在世界',
}

const ASPECT_GUIDE: Record<string, string> = {
  conjunction: '這兩股能量黏得很近，所以你常常會一次感受到兩邊的推力。',
  opposition: '這組相位會讓你感到拉扯，但也逼你學會在兩端之間找到平衡。',
  trine: '這組相位很順，像你天生就知道該怎麼把這份能力用出來。',
  square: '這組相位帶著摩擦感，雖然不輕鬆，卻常常是你成長最快的地方。',
  sextile: '這組相位像機會窗口，當你願意出手，它就會開始幫你。',
}

function getSignProfile(sign: string) {
  return SIGN_PROFILES[sign] || SIGN_PROFILES.Ari
}

function getElementLabel(value: string) {
  return ELEMENT_LABELS[value] || value
}

function getModalityLabel(value: string) {
  return MODALITY_LABELS[value] || value
}

function getHouseTheme(house: number) {
  return HOUSE_THEMES[house] || '你的人生主題'
}

function describeClosestAspect(aspects: AspectSummary[]) {
  const closest = [...aspects].sort((left, right) => left.orb - right.orb)[0]

  if (!closest) {
    return '這張盤沒有特別強壓過來的相位，表示你的能量比較像是慢慢展開，而不是一開始就被某個課題猛推。'
  }

  const guide = ASPECT_GUIDE[closest.aspect] || '這組相位會讓你在關鍵情境裡特別有感。'
  return `${closest.planet1}和${closest.planet2}的互動最明顯，${guide}`
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
    `${ELEMENT_OPENINGS[summary.dominantElement] || '你的盤有很鮮明的主節奏。'} 你給人的第一眼，常常先被${rising.name}的氣質接住，${rising.vibe}`,
    `真正把你往前推的是${sun.name}太陽，${sun.vibe} 但你心裡真正需要被照顧的地方，更多落在${moon.name}月亮，${moon.heart}`,
    `所以你不是單一個性的人，而是外在表現、內在情緒、真正渴望三條線一起在跑。整體偏${getElementLabel(summary.dominantElement)}、${getModalityLabel(summary.dominantModality)}，也難怪你總會在想前進的同時，又想找到更適合自己的節奏。`,
  ].join('\n\n')
}

function buildCoreSection(summary: {
  sun: PlanetPlacement
  moon: PlanetPlacement
  ascendant: { sign: string; signLabel: string }
  dominantElement: string
  dominantModality: string
}) {
  const sun = getSignProfile(summary.sun.sign)
  const moon = getSignProfile(summary.moon.sign)
  const rising = getSignProfile(summary.ascendant.sign)

  return {
    title: '你給人的樣子，和你真正的核心',
    body: `如果只看外在，你很容易先被讀成${rising.name}那一路的人，${rising.vibe} 但真正長期驅動你的，是${sun.name}太陽的方向感，${sun.work} 至於你心裡那塊最需要被理解的地方，則更像${moon.name}月亮，${moon.heart} 這也代表你很多時候表面看起來能撐、能做、能回應，實際上內在正在默默判斷這件事到底值不值得你投入。整張盤偏${getElementLabel(summary.dominantElement)}、${getModalityLabel(summary.dominantModality)}，${MODALITY_GUIDE[summary.dominantModality] || '你的人生不是被動的，而是帶著明顯的主動節奏。'}`,
  }
}

function buildRelationshipSection(planets: PlanetPlacement[], summary: { moon: PlanetPlacement }) {
  const moon = getSignProfile(summary.moon.sign)
  const venus = planets.find((planet) => planet.key === 'venus')
  const venusProfile = venus ? getSignProfile(venus.sign) : moon

  return {
    title: '你在關係裡，真正想被怎麼靠近',
    body: `在關係這件事上，你不是只看表面來電，真正讓你留下來的，往往是那個人能不能碰到你心裡的節奏。月亮落在${moon.name}，說明你在情緒上很在意${moon.heart} 而金星的風格又提醒你，你喜歡的靠近方式其實更偏向${venusProfile.love} 所以如果一段關係只有浪漫沒有理解，或只有陪伴沒有默契，你很快就會覺得少了什麼。你需要的是能讓你安心，又不會讓你失去自己的那種靠近。`,
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
    title: '你做事的方式，和你最容易發光的地方',
    body: `工作上，你不是沒有企圖心，而是你的企圖心有自己的味道。太陽在${sun.name}，會讓你傾向用${sun.work}的方式證明自己；火星則像你的行動引擎，現在看起來比較接近${marsProfile.work} 這代表你一旦有感，就不太只是嘴上說說。再加上天頂落在${midheaven.name}，別人也很容易在你身上看到${midheaven.work}的潛力。你最適合的，不是把自己塞進任何一個標準模板，而是找到那個能同時容納能力、節奏和成就感的舞台。`,
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
  return {
    title: '這張盤正在提醒你，下一步該學什麼',
    body: `你的人生課題，通常就藏在最常重複出現的模式裡。太陽落在${getHouseTheme(summary.sun.house)}，月亮落在${getHouseTheme(
      summary.moon.house,
    )}，說明你一邊在建立自己，一邊也在學著安放情緒。整體偏${getElementLabel(summary.dominantElement)}、${getModalityLabel(
      summary.dominantModality,
    )}，這讓你有很鮮明的主旋律，但也容易把同一套反應帶進不同情境。${describeClosestAspect(aspects)} 如果你願意更早看懂自己的節奏，而不是等事情卡住才回頭，你會發現很多困住你的，不是能力不夠，而是你還沒把自己的力量用在最對的位置上。`,
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
    subheadline: `以 ${input.placeLabel} 為定位展開後，這張盤不是只告訴你「你是誰」，而是把你平常怎麼愛、怎麼撐、怎麼往前推自己，慢慢攤開給你看。你會開始發現，那些一直重複出現的反應，其實都有跡可循。`,
    keywords: [sun.name, moon.name, rising.name, getElementLabel(summary.dominantElement), getModalityLabel(summary.dominantModality)],
    highlights: [
      `太陽落在${summary.sun.signLabel}${summary.sun.houseLabel}，你的主舞台很清楚`,
      `月亮落在${summary.moon.signLabel}${summary.moon.houseLabel}，情緒需求藏得不淺`,
      `${summary.ascendant.signLabel}上升先替你打開第一印象`,
      `${getElementLabel(summary.dominantElement)} + ${getModalityLabel(summary.dominantModality)}讓你的人生節奏很有辨識度`,
    ],
    freeReading: buildFreeReading(summary),
    premiumTeaser:
      '如果你願意再往下看，完整閱讀會把你在關係、工作、壓力反應和成長卡點裡最常出現的模式講得更細。很多你以為只是最近的狀態，其實早就在命盤裡埋好線索了。',
    sections,
  }
}
