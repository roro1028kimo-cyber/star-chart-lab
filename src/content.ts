export const APP_COPY = {
  brand: 'STAR CHART LAB',
  eyebrow: 'Western Astrology Natal Dossier',
  landingEyebrow: 'VIP DOSSIER',
  landingBrandSignature: '杉鼎森數位工程管理顧問',
  landingTitleLines: ['你的星座人生', '使用說明書'],
  landingLead:
    '把出生資料交給我之後，首頁會先把你的星盤輪廓拉出來，再用一段會回應手勢的互動過場，帶你走進第一段有感短讀。不是一下子把資料砸給你，而是一步一步讓你越看越想知道更多。',
  landingPoints: ['先看到你的星盤輪廓', '先讀 50 - 300 字短讀', '再解鎖 500 - 3000 字完整閱讀', '每一段過場都會回應你的手勢'],
  landingHint: '出生時間越準，上升與宮位越準；如果你只是先想感受流程，也可以先填最接近的時間。',
  formKicker: '輸入出生資料',
  formTitle: '先讓星盤找到你',
  formLead: '日期、時間、城市一到位，這張盤就會開始說話，而且會比你想像中更貼近你。',
  dateLabel: '出生日期',
  timeLabel: '出生時間',
  placeLabel: '出生地',
  placePlaceholder: '例如：Taipei、Tokyo、New York',
  placeLoading: '正在搜尋地點…',
  placeSelected: '已選地點',
  placeChooseHint: '請從下方挑一個正確地點。',
  placeNoResults: '暫時找不到這個地點，試試看更完整的城市名稱。',
  placeSearchError: '地點搜尋暫時沒有回應，請稍後再試一次。',
  submitIdle: '打開我的星盤',
  submitLoading: '星盤生成中…',
  submitNeedsPlace: '先選定出生地，這張盤才會準確落下來。',
  accuracyHint: '上升與宮位很吃出生時間，所以時間越接近真實，這張盤越有感。',
  noPlaceError: '請先從搜尋結果選定出生地。',
  entryTransitionTitle: '你的星圖正在醒來',
  entryTransitionLead: '滑動一下，讓光束往你靠近；點一下，星波會在畫面裡擴散。',
  entryTransitionHint: '這不是等待畫面，和它互動看看。',
  storyTitle: '你的星盤，先對你說第一句話',
  storyLead: '先看最核心的三股力量，再讀一段 50 - 300 字的短讀開場。這一頁不是要把你看完，而是要讓你很快感受到：這張盤真的有在說你。',
  storyBack: '回去重填',
  summaryTitle: '最核心的三股力量',
  freeReadingTitle: '先給你的短讀開場',
  freeReadingLead: '這段內容先用 50 - 300 字把主軸打亮，讓你很快抓到重點，也自然想往下看完整故事。',
  highlightsTitle: '這張盤最先跳出來的訊號',
  placementTitle: '完整星體落點',
  placementLead: '太陽、月亮、行星、上升與天頂都保留在這裡，讓你能直接對照每顆星體落在哪個星座、度數與宮位。',
  unlockTitle: '如果你想，再往下更深一層',
  unlockLead: '下一頁會把完整 500 - 3000 字閱讀打開，從關係、工作到成長，一層一層說清楚。很多你平常只是隱約有感的事，會在那裡變得很明白。',
  unlockButton: '看完整份閱讀',
  unlockFootnote: '把它當成一份會慢慢打開的個人檔案，而不是冷冰冰的結果頁。',
  premiumTransitionTitle: '更深的那一層，準備打開了',
  premiumTransitionLead: '拖動光束，讓藏在裡面的段落慢慢顯影。',
  premiumTransitionHint: '你靠近一點，畫面也會跟著你靠近。',
  premiumTitle: '你的完整命盤閱讀',
  premiumLead: '這裡會展開完整 500 - 3000 字長讀，把你在關係、工作與成長裡反覆出現的模式，一層一層說清楚。不是空泛鼓勵，而是把你為什麼會這樣、接下來可以怎麼看得更明白。',
  premiumBadge: '完整閱讀',
  premiumBackHome: '回到首頁',
  premiumBackStory: '回上一頁',
  premiumSectionsTitle: '慢慢讀，這份內容真的很像在寫你',
  premiumSidebarTitle: '這份閱讀會帶你看到',
  premiumSidebarItems: ['你怎麼靠近愛', '你怎麼撐住壓力', '你在哪裡最有天賦', '你現在最該鬆開什麼'],
  summaryLabels: {
    sun: '太陽',
    moon: '月亮',
    rising: '上升',
    dominant: '主能量',
  },
  placementColumns: {
    body: '星體',
    sign: '落入星座',
    degree: '度數',
    house: '落入宮位',
  },
  placementSpecial: {
    ascendant: '上升',
    midheaven: '天頂',
  },
} as const

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

export function getElementDisplay(value: string) {
  return ELEMENT_LABELS[value] || value
}

export function getModalityDisplay(value: string) {
  return MODALITY_LABELS[value] || value
}

export function formatDegree(value: number) {
  return `${value.toFixed(1)}°`
}

export function formatPlacementDegree(formattedDegree?: string, value?: number) {
  if (formattedDegree) {
    return formattedDegree.replace(/\s+/g, '')
  }

  if (typeof value === 'number') {
    return formatDegree(value)
  }

  return '--'
}

export function formatLongDate(value: string) {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function getTaiwanToday() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(new Date())
  const year = parts.find((part) => part.type === 'year')?.value || '2000'
  const month = parts.find((part) => part.type === 'month')?.value || '01'
  const day = parts.find((part) => part.type === 'day')?.value || '01'

  return `${year}-${month}-${day}`
}

export function getTaiwanYear() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
  }).format(new Date())
}

function formatTaiwanMonthDay(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function getTaiwanWeekRangeLabel() {
  const todayLabel = getTaiwanToday()
  const [year, month, day] = todayLabel.split('-').map(Number)
  const taiwanDate = new Date(Date.UTC(year, month - 1, day))
  const weekday = taiwanDate.getUTCDay()
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday
  const weekStart = new Date(taiwanDate)
  weekStart.setUTCDate(taiwanDate.getUTCDate() + diffToMonday)

  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6)

  return `${formatTaiwanMonthDay(weekStart)}-${formatTaiwanMonthDay(weekEnd)}`
}
