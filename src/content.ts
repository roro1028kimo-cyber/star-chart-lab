export const APP_COPY = {
  brand: 'STAR CHART LAB',
  eyebrow: 'Western Astrology Natal Dossier',
  landingTitle: '星盤不是一張圖，它更像你靈魂的使用說明',
  landingLead:
    '輸入出生資料後，畫面會先帶你穿過一段會回應手勢的星體過場，接著讓你看到一段短短的開場解讀。想再往下，就把完整閱讀打開。',
  landingPoints: ['打開本命盤', '先聽見第一句話', '看見關係與天賦線索', '再往下進完整閱讀'],
  landingHint: '出生時間越準，上升與宮位越準；如果你只是先想感受流程，也可以先填最接近的時間。',
  formTitle: '把你的出生資料交給我',
  formLead: '日期、時間、城市一到位，這張盤就會開始說話。',
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
  entryTransitionLead: '滑動一下，讓光點往你靠近；點一下，星波會往外擴散。',
  entryTransitionHint: '這不是等待畫面，和它互動看看。',
  storyTitle: '你的星盤，先對你說第一句話',
  storyLead: '先看最核心的三股力量，再讀這段短短的開場。如果你想更深入，下一頁會把整份閱讀展開。',
  storyBack: '回去重填',
  summaryTitle: '最核心的三股力量',
  freeReadingTitle: '先給你的第一眼解讀',
  freeReadingLead: '不是制式報告，而是一段先讓你有感的開場。',
  highlightsTitle: '這張盤最先跳出來的訊號',
  unlockTitle: '如果你想，再往下更深一層',
  unlockLead: '下一頁不只是把資料攤開，而是會把你在愛、工作與成長裡最常反覆的模式說清楚。',
  unlockButton: '看完整份閱讀',
  unlockFootnote: '把它當成一份會慢慢打開的個人檔案，而不是冷冰冰的結果頁。',
  premiumTransitionTitle: '更深的那一層，準備打開了',
  premiumTransitionLead: '拖動光束，讓藏在裡面的段落慢慢顯影。',
  premiumTransitionHint: '你靠近一點，畫面也會跟著你靠近。',
  premiumTitle: '你的完整命盤閱讀',
  premiumLead: '這裡不只是整理資訊，而是把你在關係、工作與成長裡真正會卡住的地方，一層一層說清楚。',
  premiumBadge: '完整閱讀',
  premiumBackHome: '回到首頁',
  premiumBackStory: '回上一頁',
  premiumSectionsTitle: '慢慢讀，這份內容是寫給你的',
  premiumSidebarTitle: '這份閱讀會帶你看到',
  premiumSidebarItems: ['你怎麼靠近愛', '你怎麼撐住壓力', '你在哪裡最有天賦', '你現在最該鬆開什麼'],
  summaryLabels: {
    sun: '太陽',
    moon: '月亮',
    rising: '上升',
    dominant: '主能量',
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
