export const APP_COPY = {
  brand: 'STAR CHART LAB',
  eyebrow: 'Western Astrology Natal Dossier',
  landingTitle: '把你的星盤，讀成一份真的看得懂的人生檔案',
  landingLead:
    '這一版先專注在西洋占星本命盤體驗。你會先輸入出生資料、穿過互動式過場，看到一段 50-300 字的首版解讀，再進到完整付費頁面的長版閱讀。',
  landingPoints: ['輸入出生資料', '互動式星體過場', '首版短讀 50-300 字', '長版付費頁面預留'],
  landingHint: '出生時間越準，上升與宮位越準；如果不知道分鐘，也可以先用最接近的時間驗證流程。',
  formTitle: '先打開你的星盤',
  formLead: '請先完成出生日期、時間與地點，系統會直接生成本命盤與首版解讀。',
  dateLabel: '出生日期',
  timeLabel: '出生時間',
  placeLabel: '出生地',
  placePlaceholder: '例如：Taipei、Tokyo、New York',
  placeLoading: '正在搜尋地點…',
  placeSelected: '已選地點',
  placeChooseHint: '請從下方結果選一個正確地點。',
  placeNoResults: '找不到符合的地點，請試著輸入更完整的城市名稱。',
  placeSearchError: '地點搜尋目前不可用，請確認後端 API 是否正常。',
  submitIdle: '生成我的星盤',
  submitLoading: '星盤生成中…',
  submitNeedsPlace: '請先從搜尋結果選一個出生地。',
  accuracyHint: '本命盤的上升與宮位很吃出生時間，若時間差太多，結果也會跟著偏移。',
  noPlaceError: '請先從搜尋結果選定出生地。',
  entryTransitionTitle: '星盤正在對焦',
  entryTransitionLead: '移動游標讓星體偏移，點一下會掀起一圈星波。',
  entryTransitionHint: '滑動或點一下，畫面會跟著你的手勢改變。',
  storyTitle: '你的首版星盤解讀',
  storyLead: '這一頁先讓你抓到命盤的核心輪廓，再決定要不要進入完整付費版長讀。',
  storyBack: '返回重填',
  summaryTitle: '命盤核心三角',
  freeReadingTitle: '初次解讀',
  freeReadingLead: '首版內容以規則式文案流程生成，先驗證體驗與資料流。',
  highlightsTitle: '這張盤目前最亮的地方',
  unlockTitle: '完整付費頁面',
  unlockLead: '下一頁會展開更長的閱讀版本，先把關係、工作節奏與成長課題打開。',
  unlockButton: '進入付費頁面',
  unlockFootnote: '這一版先把前端閱讀體驗與資料結構拉直，付費 skill 之後再補上。',
  premiumTransitionTitle: '完整報告即將展開',
  premiumTransitionLead: '拖動光束，讓完整檔案慢慢顯影。',
  premiumTransitionHint: '移動游標，光圈會跟著你偏移。',
  premiumTitle: '完整付費版命盤閱讀',
  premiumLead: '目前先用規則式內容驗證長文閱讀流程；後續可以直接接上付費 skill 與真實金流。',
  premiumBadge: 'Paid Page Prototype',
  premiumBackHome: '回到首頁',
  premiumBackStory: '回到次頁',
  premiumSectionsTitle: '完整解讀段落',
  premiumSidebarTitle: '這一頁現在承接什麼',
  premiumSidebarItems: ['500-3000 字長版閱讀', '模組化段落結構', '後續可接付費 skill', '可接真實金流與會員權限'],
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
