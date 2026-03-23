import type { NatalChartResult } from './types'

export type Locale = 'zh-TW' | 'en'

type MaskedCard = {
  title: string
  body: string
}

type CopyDeck = {
  brand: string
  eyebrow: string
  localeLabel: string
  localeOptions: Record<Locale, string>
  landingTitle: string
  landingLead: string
  landingBullets: string[]
  landingHint: string
  formEyebrow: string
  formTitle: string
  formLead: string
  formSubmitHint: string
  dateLabel: string
  timeLabel: string
  placeLabel: string
  placePlaceholder: string
  placeLoading: string
  placeSelected: string
  placeChooseHint: string
  placeNoResults: string
  placeSearchError: string
  submitIdle: string
  submitLoading: string
  submitNeedsPlace: string
  accuracyHint: string
  noPlaceError: string
  flightTitle: string
  flightLead: string
  storyEyebrow: string
  storyTitle: string
  storyLead: string
  storyBack: string
  storyHighlightsTitle: string
  storyProgress: {
    chart: string
    personality: string
    weekly: string
    monthly: string
    reminder: string
    premium: string
  }
  chartTitle: string
  chartLead: string
  summaryLabels: {
    sun: string
    moon: string
    rising: string
    dominant: string
  }
  personalityTitle: string
  weeklyTitle: string
  monthlyTitle: string
  reminderTitle: string
  premiumTitle: string
  premiumLead: string
  premiumMaskTitle: string
  premiumMaskLead: string
  premiumMaskCards: MaskedCard[]
  premiumButton: string
  premiumFootnote: string
  premiumFlightTitle: string
  premiumFlightLead: string
  premiumEyebrow: string
  premiumPageTitle: string
  premiumPageLead: string
  premiumBackHome: string
  premiumIntroTitle: string
  premiumIntroLead: string
  aiTitle: string
  aiLead: string
  aiLoading: string
  aiUnavailableTitle: string
  aiUnavailableLead: string
  aiRouteLabel: string
  emailTitle: string
  emailLead: string
  emailLoading: string
  emailUnavailableTitle: string
  emailUnavailableLead: string
  emailRouteLabel: string
  emailStatusReady: string
  emailStatusPending: string
  architectureTitle: string
  architectureLead: string
  architectureItems: Array<{
    label: string
    value: string
  }>
}

const COPY: Record<Locale, CopyDeck> = {
  'zh-TW': {
    brand: 'STAR CHART LAB',
    eyebrow: 'Western Astrology Natal Dossier',
    localeLabel: '語言切換',
    localeOptions: {
      'zh-TW': '繁中',
      en: 'EN',
    },
    landingTitle: '星座的人生使用說明書',
    landingLead:
      '不是再看一篇空泛的星座文，而是把你的出生資料整理成一份真的讀得下去的個人命盤說明。先打開免費版的命盤主軸、整體個性、本周運勢、本月運勢與提醒，再決定要不要往完整白底檔案走。',
    landingBullets: ['先拿到命盤主軸', '直接進入個人說明', '底部再看付費解鎖', '完整版切到白底檔案'],
    landingHint: '右側先填出生資料。送出後會先穿過星辰，再進入第二頁。',
    formEyebrow: 'Get The Chart',
    formTitle: '先把你的命盤打開',
    formLead: '出生日期、時間、地點送出後，就直接進第二頁，不先讓你在首頁繞路。',
    formSubmitHint: '送出後會先進入星辰飛越過場，再打開個人說明。',
    dateLabel: '出生日期',
    timeLabel: '出生時間',
    placeLabel: '出生地點',
    placePlaceholder: '輸入城市，例如台北、東京、New York',
    placeLoading: '正在搜尋地點…',
    placeSelected: '已選地點',
    placeChooseHint: '請從下方搜尋結果點選一個地點。',
    placeNoResults: '找不到對應地點，請換成更完整的城市名稱再試一次。',
    placeSearchError:
      '地點搜尋服務目前無法連線。前端 8200 的 /api 代理沒有成功接到 8787 後端，請先確認 API server 已啟動，或補上 VITE_API_BASE_URL。',
    submitIdle: '取得我的命盤',
    submitLoading: '命盤生成中…',
    submitNeedsPlace: '先選好出生地點，才能繼續取得命盤。',
    accuracyHint: '時間越準，上升星座與宮位越準；如果現在先驗證流程，也可以先填接近時間。',
    noPlaceError: '請先從搜尋結果中選擇一個出生地點。',
    flightTitle: '星辰正在往你靠近',
    flightLead: '命盤已開始生成。接下來會先穿過一段飛星過場，再進入你的個人說明頁。',
    storyEyebrow: 'Personal Manual',
    storyTitle: '你的個人說明，正在一段段打開',
    storyLead:
      '第二頁先把免費可讀的核心內容展開給你看。下方灰色區塊只先露出結構，真正完整的人生建議會留在付費後的白底頁。',
    storyBack: '重新輸入命盤',
    storyHighlightsTitle: '這一頁會先打開',
    storyProgress: {
      chart: '命盤主軸',
      personality: '整體個性',
      weekly: '本周運勢',
      monthly: '本月運勢',
      reminder: '本月提醒',
      premium: '閱讀更多',
    },
    chartTitle: '你的命盤底圖',
    chartLead: '先看太陽、月亮、上升與盤面主導元素，知道你的內在引擎怎麼運作。',
    summaryLabels: {
      sun: '太陽',
      moon: '月亮',
      rising: '上升',
      dominant: '主導能量',
    },
    personalityTitle: '整體個性',
    weeklyTitle: '本周運勢',
    monthlyTitle: '本月運勢',
    reminderTitle: '本月提醒',
    premiumTitle: '閱讀更多',
    premiumLead: '關係模式、工作節奏、個人人生建議與 email 交付版本，都會在最下面的白底完整檔案打開。',
    premiumMaskTitle: '付費後可讀內容',
    premiumMaskLead: '先讓你知道會多看到什麼，但真正文字內容先用灰色方塊遮住。',
    premiumMaskCards: [
      { title: '感情與關係模式', body: '你在關係裡最常重演的互動節奏，和最容易看錯的地方。' },
      { title: '工作與節奏建議', body: '什麼樣的推進方式最適合你，什麼環境最容易耗掉你。' },
      { title: '個人人生建議', body: '把命盤翻成一段比較誠實、比較貼近現況的人生提醒。' },
      { title: 'Email 交付版本', body: '付費後會整理成可寄出的個人檔案，連同建議一起送到信箱。' },
    ],
    premiumButton: '閱讀更多（付費解鎖）',
    premiumFootnote: '按下後會進入白場過場，接著打開完整白底檔案。',
    premiumFlightTitle: '一個小光點正在靠近',
    premiumFlightLead: '光點會一路飛向鏡頭，白場之後就是完整個人資訊頁。',
    premiumEyebrow: 'Premium Personal File',
    premiumPageTitle: '完整個人資訊',
    premiumPageLead:
      '第三頁改成白底黑字的清爽檔案頁，讓完整命盤說明、AI 分析與 email 交付位置都能放在同一個閱讀節奏裡。',
    premiumBackHome: '回到首頁',
    premiumIntroTitle: '這是你的完整檔案抬頭',
    premiumIntroLead: '先看命盤總題，再往下讀完整個人解析與 AI 建議。',
    aiTitle: 'AI 個人分析',
    aiLead: '這一區直接串到後端 AI 分析 route。哥哥把 API key 與模型補上後，這裡就會自動長出完整個人建議。',
    aiLoading: 'AI 正在整理你的個人分析…',
    aiUnavailableTitle: 'AI 分析 API 尚未填入',
    aiUnavailableLead: '前後端接點已經留好。只要補上 API key 與 model，第三頁就會直接顯示 AI 內容。',
    aiRouteLabel: 'AI 分析 Route',
    emailTitle: 'Email 交付位置',
    emailLead: '付費後的完整檔案與個人人生建議，預留從這裡交給 email 發送服務。',
    emailLoading: '正在確認 email placeholder…',
    emailUnavailableTitle: 'Email API 位置讀取失敗',
    emailUnavailableLead: '目前還沒拿到 email placeholder 的回應，但前端位置已保留。',
    emailRouteLabel: 'Email 發送 Route',
    emailStatusReady: '已填入 email API',
    emailStatusPending: '待填入 email API',
    architectureTitle: 'API 架構位置',
    architectureLead: '下面這些位置都已經接進頁面，哥哥之後只要填入自己的 API 就能接續往下做。',
    architectureItems: [
      { label: 'AI 分析 Route', value: '/api/insights/ai' },
      { label: 'Email 發送 Route', value: '/api/premium/email' },
      { label: 'AI 環境變數', value: 'AI_PROVIDER / OPENAI_API_KEY / OPENAI_MODEL / GEMINI_API_KEY / GEMINI_MODEL' },
      { label: 'Email 環境變數', value: 'EMAIL_DELIVERY_API_URL / EMAIL_DELIVERY_API_KEY' },
    ],
  },
  en: {
    brand: 'STAR CHART LAB',
    eyebrow: 'Western Astrology Natal Dossier',
    localeLabel: 'Language',
    localeOptions: {
      'zh-TW': '繁中',
      en: 'EN',
    },
    landingTitle: 'The life manual inside your chart',
    landingLead:
      'This is not another vague zodiac article. It turns your birth data into a readable personal dossier. The free layer opens your chart axis, personality, this week, this month, and one reminder first, then moves the fuller file into a paid white-page experience.',
    landingBullets: ['Open the chart first', 'Move straight into the personal manual', 'Keep the paid unlock at the bottom', 'Shift the full file into a white page'],
    landingHint: 'Fill the birth data on the right first. After submit, the star-flight transition opens before the second page.',
    formEyebrow: 'Get The Chart',
    formTitle: 'Open your chart first',
    formLead: 'As soon as the birth date, time, and place are submitted, the second page begins. No long detour on the landing page.',
    formSubmitHint: 'Submit to enter the star-flight transition, then the personal manual page.',
    dateLabel: 'Birth date',
    timeLabel: 'Birth time',
    placeLabel: 'Birth place',
    placePlaceholder: 'Enter a city such as Taipei, Tokyo, or New York',
    placeLoading: 'Searching places…',
    placeSelected: 'Selected place',
    placeChooseHint: 'Choose one place from the search results below.',
    placeNoResults: 'No matching place was found. Try a more complete city name.',
    placeSearchError:
      'Place search is unavailable right now. The 8200 frontend proxy could not reach the 8787 backend. Make sure the API server is running or fill VITE_API_BASE_URL.',
    submitIdle: 'Get my chart',
    submitLoading: 'Generating chart…',
    submitNeedsPlace: 'Choose a birth place before continuing.',
    accuracyHint: 'The closer the birth time, the more accurate the rising sign and house placements become.',
    noPlaceError: 'Please choose a birth place from the search results first.',
    flightTitle: 'The stars are moving toward you',
    flightLead: 'Your chart is being prepared. The experience passes through a star-flight sequence before opening the second page.',
    storyEyebrow: 'Personal Manual',
    storyTitle: 'Your personal manual is opening in sequence',
    storyLead:
      'The second page reveals the free reading first. Grey blocks at the bottom preview what becomes readable after payment in the white-page file.',
    storyBack: 'Edit birth data',
    storyHighlightsTitle: 'What opens on this page',
    storyProgress: {
      chart: 'Chart Axis',
      personality: 'Personality',
      weekly: 'This Week',
      monthly: 'This Month',
      reminder: 'Reminder',
      premium: 'Read More',
    },
    chartTitle: 'Your natal base map',
    chartLead: 'Start with the main axis so you can see how your inner engine works.',
    summaryLabels: {
      sun: 'Sun',
      moon: 'Moon',
      rising: 'Rising',
      dominant: 'Dominant energy',
    },
    personalityTitle: 'Overall personality',
    weeklyTitle: 'This week',
    monthlyTitle: 'This month',
    reminderTitle: 'Monthly reminder',
    premiumTitle: 'Read more',
    premiumLead: 'Relationship patterns, work rhythm, life advice, and the email-ready version all open in the paid white-page file.',
    premiumMaskTitle: 'Paid content preview',
    premiumMaskLead: 'You can see the structure first, but the actual text stays covered in grey.',
    premiumMaskCards: [
      { title: 'Relationship pattern', body: 'The interaction rhythm you repeat most often and the blind spot inside it.' },
      { title: 'Work rhythm guidance', body: 'The pace that supports you and the environment that drains you fastest.' },
      { title: 'Personal life advice', body: 'A direct and more honest life note translated from the chart.' },
      { title: 'Email delivery file', body: 'The paid version can be packaged into a file and delivered by email.' },
    ],
    premiumButton: 'Read More (Paid Unlock)',
    premiumFootnote: 'This triggers the white-flash transition before the full file opens.',
    premiumFlightTitle: 'A point of light is getting closer',
    premiumFlightLead: 'The light flies into the camera, then the full white-page file opens.',
    premiumEyebrow: 'Premium Personal File',
    premiumPageTitle: 'Full personal information',
    premiumPageLead:
      'The third page switches to a cleaner white-page file so the full chart explanation, AI reading, and email delivery placeholder can live in one calm reading flow.',
    premiumBackHome: 'Back to landing',
    premiumIntroTitle: 'This is the full-file header',
    premiumIntroLead: 'Start with the chart headline, then move into the deeper interpretation and AI reading.',
    aiTitle: 'AI personal analysis',
    aiLead: 'This section calls the backend AI analysis route. Once your API key and model are filled in, the third page can render the analysis directly here.',
    aiLoading: 'AI is preparing your personal analysis…',
    aiUnavailableTitle: 'AI analysis API is not filled in yet',
    aiUnavailableLead: 'The frontend and backend connection points are already in place. Fill the API key and model to render the AI result here.',
    aiRouteLabel: 'AI Analysis Route',
    emailTitle: 'Email delivery point',
    emailLead: 'The paid file and personal life advice are meant to hand off to an email delivery service from here.',
    emailLoading: 'Checking email placeholder…',
    emailUnavailableTitle: 'Email API placeholder could not be read',
    emailUnavailableLead: 'The frontend slot is reserved, but the placeholder response is not available yet.',
    emailRouteLabel: 'Email Delivery Route',
    emailStatusReady: 'Email API configured',
    emailStatusPending: 'Email API pending',
    architectureTitle: 'API architecture',
    architectureLead: 'These positions are already wired into the page. You can continue by filling in your own APIs later.',
    architectureItems: [
      { label: 'AI Analysis Route', value: '/api/insights/ai' },
      { label: 'Email Delivery Route', value: '/api/premium/email' },
      { label: 'AI Env Vars', value: 'AI_PROVIDER / OPENAI_API_KEY / OPENAI_MODEL / GEMINI_API_KEY / GEMINI_MODEL' },
      { label: 'Email Env Vars', value: 'EMAIL_DELIVERY_API_URL / EMAIL_DELIVERY_API_KEY' },
    ],
  },
}

const SIGN_NAME_BY_SHORT: Record<string, { 'zh-TW': string; en: string }> = {
  Ari: { 'zh-TW': '牡羊座', en: 'Aries' },
  Tau: { 'zh-TW': '金牛座', en: 'Taurus' },
  Gem: { 'zh-TW': '雙子座', en: 'Gemini' },
  Can: { 'zh-TW': '巨蟹座', en: 'Cancer' },
  Leo: { 'zh-TW': '獅子座', en: 'Leo' },
  Vir: { 'zh-TW': '處女座', en: 'Virgo' },
  Lib: { 'zh-TW': '天秤座', en: 'Libra' },
  Sco: { 'zh-TW': '天蠍座', en: 'Scorpio' },
  Sag: { 'zh-TW': '射手座', en: 'Sagittarius' },
  Cap: { 'zh-TW': '摩羯座', en: 'Capricorn' },
  Aqu: { 'zh-TW': '水瓶座', en: 'Aquarius' },
  Pis: { 'zh-TW': '雙魚座', en: 'Pisces' },
}

const ELEMENT_LABELS: Record<string, { 'zh-TW': string; en: string }> = {
  Fire: { 'zh-TW': '火象', en: 'Fire' },
  Earth: { 'zh-TW': '土象', en: 'Earth' },
  Air: { 'zh-TW': '風象', en: 'Air' },
  Water: { 'zh-TW': '水象', en: 'Water' },
}

const MODALITY_LABELS: Record<string, { 'zh-TW': string; en: string }> = {
  Cardinal: { 'zh-TW': '基本宮', en: 'Cardinal' },
  Fixed: { 'zh-TW': '固定宮', en: 'Fixed' },
  Mutable: { 'zh-TW': '變動宮', en: 'Mutable' },
}

export function getLocaleCopy(locale: Locale) {
  return COPY[locale]
}

export function getSignDisplay(short: string, fallback: string, locale: Locale) {
  return SIGN_NAME_BY_SHORT[short]?.[locale] || fallback
}

export function getElementDisplay(value: string, locale: Locale) {
  return ELEMENT_LABELS[value]?.[locale] || value
}

export function getModalityDisplay(value: string, locale: Locale) {
  return MODALITY_LABELS[value]?.[locale] || value
}

export function formatDegree(value: number, locale: Locale) {
  const formatter = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'zh-TW', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  return `${formatter.format(value)}°`
}

export function formatLongDate(value: string, locale: Locale) {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function buildPersonalityOverview(chart: NatalChartResult, locale: Locale) {
  const sun = getSignDisplay(chart.summary.sun.sign, chart.summary.sun.signLabel, locale)
  const moon = getSignDisplay(chart.summary.moon.sign, chart.summary.moon.signLabel, locale)
  const rising = getSignDisplay(chart.summary.ascendant.sign, chart.summary.ascendant.signLabel, locale)
  const element = getElementDisplay(chart.summary.dominantElement, locale)
  const modality = getModalityDisplay(chart.summary.dominantModality, locale)

  if (locale === 'en') {
    return `Your chart blends the drive of ${sun}, the emotional instinct of ${moon}, and the social first impression shaped by ${rising}, so people rarely understand you completely at first glance. One part of you wants direction, momentum, and a clear answer fast; another part keeps scanning for emotional proof before it fully commits. Because ${element} and ${modality} dominate the chart, your life tends to revolve around a repeating lesson: where to invest your energy, where to draw a line, and how to stop leaking yourself into things that no longer deserve you. When your timing, emotion, and decision-making finally pull in the same direction, you become much harder to shake.`
  }

  return `你的命盤把 ${sun} 的推進力、${moon} 的情緒反應，以及 ${rising} 給人的第一印象疊在一起，所以你很少只呈現單一面向。別人第一眼看到的你，可能比真實的你更果斷、更冷靜，或更有方向感，但你內在其實一直在衡量：這件事值不值得投入、這段關係安不安全、這個選擇會不會讓自己之後更累。也因為 ${element} 與 ${modality} 在盤面裡偏強，你的人生常常不是輸在能力不夠，而是輸在能量分配不夠精準，或者太早答應了不該接的事。當你開始把情緒、判斷與行動節奏排回同一條線，很多原本像卡住的問題，反而會慢慢自己鬆開。`
}

export function buildWeeklyPulse(chart: NatalChartResult, locale: Locale) {
  const sun = getSignDisplay(chart.summary.sun.sign, chart.summary.sun.signLabel, locale)

  if (locale === 'en') {
    return `This week, let the ${sun} part of you pause before reacting. The slower answer will likely be the more accurate one, especially in conversations or quick decisions.`
  }

  return `這週先讓 ${sun} 的那股衝勁停半拍，再回應外界；尤其是對話與臨時決定，慢一點反而更準。`
}

export function buildMonthlyOutlook(chart: NatalChartResult, locale: Locale) {
  const moon = getSignDisplay(chart.summary.moon.sign, chart.summary.moon.signLabel, locale)
  const section = chart.interpretation.sections[0]?.title || (locale === 'en' ? 'your deeper pattern' : '你更深層的課題')

  if (locale === 'en') {
    return `This month is less about forcing momentum and more about restoring inner order. The ${moon} side of your chart needs emotional clarity first; otherwise work, communication, or relationships can feel louder and heavier than they really are. Something connected to ${section} is likely to return to your attention. If you keep postponing it, pressure turns into fog. If you answer with steadier pacing and a cleaner boundary, the month starts opening in your favor.`
  }

  return `這個月的重點，不是硬把事情往前推，而是先把你內在真正重要的順序排回來。命盤裡 ${moon} 的那一面，這段時間特別需要情緒上的釐清；不然工作、溝通或關係都很容易被你感覺得比實際更吵、更重。跟「${section}」有關的議題，這個月很可能會再次被推到你面前。你如果一直拖著不回應，壓力就會慢慢積成混亂；但只要你願意先穩住節奏，再把界線說清楚，很多原本卡住的地方就會開始鬆動。`
}

export function buildMonthlyReminder(chart: NatalChartResult, locale: Locale) {
  const rising = getSignDisplay(chart.summary.ascendant.sign, chart.summary.ascendant.signLabel, locale)

  if (locale === 'en') {
    return `Do not rush to prove yourself. Let the ${rising} part of you choose the pace first.`
  }

  return `別急著證明自己，先讓 ${rising} 的節奏感把你拉回正軌。`
}
