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
    throw new Error(`AI prompt 缺少 ${label} 的命盤資料。`)
  }

  return `${label}：${planet.signLabel}、${planet.houseLabel}、${formatDegree(planet.degree)}°${planet.retrograde ? '、逆行' : ''}`
}

function buildPrompt(chart: NatalChartResult) {
  const analysisYear = getAnalysisYear()
  const planetSummary = PROMPT_PLANET_ORDER.map((planet) => formatPlanetLine(chart, planet.key, planet.label)).join('\n')
  const aspectSummary = chart.aspects
    .slice(0, 5)
    .map((aspect) => `${aspect.planet1} / ${aspect.planet2}：${aspect.aspect}（orb ${aspect.orb.toFixed(2)}°）`)
    .join('\n')

  return `你是一位擅長西洋占星本命盤解讀的占星內容編輯，請根據以下資料，寫出一篇繁體中文、可直接給使用者閱讀的長版命盤分析。

請遵守：
1. 只用繁體中文。
2. 不要條列資料回填，要像人寫的完整分析。
3. 語氣要深度、清楚、有畫面，但不要神神叨叨。
4. 內容長度控制在 700 到 1200 字。
5. 內容需包含：人格核心、情感模式、工作天賦、近期成長提醒。
6. 不要虛構使用者沒有提供的事件。

命盤摘要：
${planetSummary}

上升：${chart.summary.ascendant.signLabel} ${formatDegree(chart.summary.ascendant.degree)}°
天頂：${chart.summary.midheaven.signLabel} ${formatDegree(chart.summary.midheaven.degree)}°
主能量：${chart.summary.dominantElement} / ${chart.summary.dominantModality}

主要相位：
${aspectSummary || '無明顯主要相位資料'}

已知規則式解讀可作為基礎，但請重新整合成一篇自然流暢的長文：
標題：${chart.interpretation.headline}
短摘要：${chart.interpretation.subheadline}
免費短讀：
${chart.interpretation.freeReading}

段落參考：
${chart.interpretation.sections.map((section) => `${section.title}：${section.body}`).join('\n')}

分析年份：${analysisYear}`
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
    throw new Error(payload?.error?.message || 'OpenAI 回應失敗。')
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
        ? 'OpenAI 輸出被 token 上限截斷，請調高輸出長度。'
        : 'OpenAI 沒有回傳有效內容。',
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
    throw new Error(payload?.error?.message || 'Gemini 回應失敗。')
  }

  return payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || ''
}

export async function generateAiAdvice(chart: NatalChartResult) {
  const provider = getPreferredAiProvider()

  if (!provider) {
    throw new Error('目前尚未設定 AI API 金鑰。')
  }

  const prompt = buildPrompt(chart)

  if (provider === 'openai') {
    return generateWithOpenAI(prompt)
  }

  return generateWithGemini(prompt)
}
