import { config, getPreferredAiProvider } from '../config.js'
import type { NatalChartResult } from '../types.js'

const PROMPT_PLANET_ORDER = [
  { key: 'sun', label: '太陽' },
  { key: 'moon', label: '月亮' },
  { key: 'mercury', label: '水星' },
  { key: 'venus', label: '金星' },
  { key: 'mars', label: '火星' },
  { key: 'jupiter', label: '木星' },
  { key: 'saturn', label: '土星' },
  { key: 'uranus', label: '天王星' },
  { key: 'neptune', label: '海王星' },
  { key: 'pluto', label: '冥王星' },
] as const

function getAnalysisYear() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
  }).format(new Date())
}

function formatDegree(value: number) {
  return value.toFixed(2)
}

function formatPlanetLine(chart: NatalChartResult, key: (typeof PROMPT_PLANET_ORDER)[number]['key'], label: string) {
  const planet = chart.planets.find((item) => item.key === key)

  if (!planet) {
    throw new Error(`AI prompt 建立失敗：找不到 ${label} 的盤面資料。`)
  }

  return `${label}：${planet.signLabel} 第${planet.house}宮 ${formatDegree(planet.degree)}°${planet.retrograde ? ' 逆行' : ''}`
}

function buildPrompt(chart: NatalChartResult) {
  const analysisYear = getAnalysisYear()

  const planetSummary = PROMPT_PLANET_ORDER.map((planet) => formatPlanetLine(chart, planet.key, planet.label)).join('\n')

  const aspectSummary = chart.aspects
    .slice(0, 5)
    .map((aspect) => `${aspect.planet1} / ${aspect.planet2}：${aspect.aspect}（orb ${aspect.orb.toFixed(2)}°）`)
    .join('\n')

  return `你是一位擅長把西洋占星翻成可讀人生說明書的分析師，風格誠實、銳利、有溫度，不說空話。

你的任務是根據使用者的星盤資料，輸出一份適合放在「白底黑字個人檔案頁」上的完整個人分析。

【星盤資料】
${planetSummary}

【補充參考】
上升：${chart.summary.ascendant.signLabel} ${formatDegree(chart.summary.ascendant.degree)}°
最緊密相位：
${aspectSummary || '無'}

【分析年份】${analysisYear}

【輸出格式】
請直接用繁體中文輸出，使用以下標題順序，不要加前言、免責聲明、方法說明，也不要使用 markdown 表格：

1. 個性核心
2. 目前的人生節奏
3. 關係與情感模式
4. 工作天賦與消耗點
5. ${analysisYear} 年提醒
6. 一句人生建議

【寫作要求】
- 全文 700 到 1200 字
- 第二人稱統一使用「你」
- 每一節都要盡量對應具體的行星、宮位或相位
- 不要只說優點，必須寫出真實弱點、拖延點、盲點或容易卡住的地方
- 語氣像一個看得懂你的人在直接對你說話，不要像教科書
- 請把文字寫成連續可閱讀的段落，不要輸出條列符號
- 「一句人生建議」請單獨成段，控制在 40 字內，直接、有力、像收尾提醒`
}

async function generateWithOpenAI(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.openAiModel,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt,
            },
          ],
        },
      ],
      reasoning: {
        effort: 'low',
      },
      max_output_tokens: 1800,
    }),
  })

  const payload = (await response.json()) as {
    error?: { message?: string }
    output_text?: string
    incomplete_details?: { reason?: string }
    output?: Array<{
      type?: string
      content?: Array<{ type?: string; text?: string }>
    }>
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'OpenAI 產生失敗。')
  }

  const text =
    payload.output_text?.trim() ||
    payload.output
      ?.flatMap((item) => item.content || [])
      .map((item) => item.text?.trim() || '')
      .filter(Boolean)
      .join('\n')
      .trim() ||
    ''

  if (!text) {
    throw new Error(
      payload.incomplete_details?.reason === 'max_output_tokens'
        ? 'OpenAI 回應被推理內容吃掉了，尚未產出可讀文字。'
        : 'OpenAI 已回應，但沒有產出可讀文字。',
    )
  }

  return text
}

async function generateWithGemini(prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1800,
      },
    }),
  })

  const payload = (await response.json()) as {
    error?: { message?: string }
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Gemini 產生失敗。')
  }

  return payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('\n') || ''
}

export async function generateAiAdvice(chart: NatalChartResult) {
  const provider = getPreferredAiProvider()

  if (!provider) {
    throw new Error('尚未設定 AI API key。')
  }

  const prompt = buildPrompt(chart)

  if (provider === 'openai') {
    return generateWithOpenAI(prompt)
  }

  return generateWithGemini(prompt)
}
