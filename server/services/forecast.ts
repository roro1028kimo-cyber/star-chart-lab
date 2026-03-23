import crypto from 'node:crypto'
import { ForecastKind, ForecastStatus } from '@prisma/client'
import { config, getPreferredAiProvider } from '../config.js'
import { prisma } from '../lib/prisma.js'
import type { NatalChartResult } from '../types.js'

type ForecastWindow = 'yearly' | 'weekly'

type StoredForecastContent = {
  chartFingerprint: string
  title: string
  summary: string
  body: string
  bullets: string[]
}

type ForecastPayload = {
  kind: ForecastWindow
  periodKey: string
  title: string
  summary: string
  body: string
  bullets: string[]
  generatedAt: string
  cached: boolean
  stored: boolean
  source: 'openai' | 'gemini'
}

type GeneratedForecastContent = {
  title: string
  summary: string
  body: string
  bullets: string[]
}

function getTaiwanYearKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
  }).format(new Date())
}

function getTaiwanWeekKey() {
  const dateString = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const [year, month, day] = dateString.split('-').map(Number)
  const current = new Date(Date.UTC(year, month - 1, day))
  const weekday = current.getUTCDay()
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday
  const start = new Date(current)
  start.setUTCDate(current.getUTCDate() + diffToMonday)

  const parts = [
    start.getUTCFullYear(),
    String(start.getUTCMonth() + 1).padStart(2, '0'),
    String(start.getUTCDate()).padStart(2, '0'),
  ]

  return parts.join('-')
}

function buildChartFingerprint(chart: NatalChartResult) {
  const raw = [
    chart.input.date,
    chart.input.time,
    chart.input.placeLabel,
    chart.input.lat.toFixed(4),
    chart.input.lon.toFixed(4),
  ].join('|')

  return crypto.createHash('sha256').update(raw).digest('hex')
}

function buildForecastPrompt(chart: NatalChartResult, kind: ForecastWindow, periodKey: string) {
  const mainPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']
    .map((key) => chart.planets.find((planet) => planet.key === key))
    .filter((planet): planet is NonNullable<typeof planet> => Boolean(planet))
    .map((planet) => `${planet.label}：${planet.signLabel}，${planet.houseLabel}，${planet.formattedDegree}${planet.retrograde ? '，逆行' : ''}`)
    .join('\n')

  const scopeLine =
    kind === 'yearly'
      ? `請輸出 ${periodKey} 年度個人預測。`
      : `請輸出 ${periodKey} 這一週的個人運勢分析。`

  return `你是一位擅長西洋占星內容的繁體中文寫作者，請根據以下本命盤資料，輸出可直接給使用者閱讀的${kind === 'yearly' ? '年度' : '本周'}分析。

請遵守：
1. 只用繁體中文。
2. 語氣要像專業但不冰冷的朋友，清楚、有畫面、不要像工作報告。
3. 不要洩漏你是 AI，不要要求使用者再提供資料。
4. 請輸出 JSON，格式必須是：
{
  "title": "字串",
  "summary": "80-160字摘要",
  "body": "400-1200字完整內容",
  "bullets": ["重點1", "重點2", "重點3"]
}
5. bullets 請給 3 點，都是完整短句。
6. 年度分析聚焦：年度主題、關係、人際、工作、成長提醒。
7. 本周分析聚焦：本周情緒、工作節奏、關係互動、提醒。

${scopeLine}

使用者出生資料：
- 日期：${chart.input.date}
- 時間：${chart.input.time}
- 地點：${chart.input.placeLabel}

命盤核心：
- 標題：${chart.interpretation.headline}
- 摘要：${chart.interpretation.subheadline}
- 主能量：${chart.summary.dominantElement} / ${chart.summary.dominantModality}
- 上升：${chart.summary.ascendant.signLabel} ${chart.summary.ascendant.formattedDegree}
- 天頂：${chart.summary.midheaven.signLabel} ${chart.summary.midheaven.formattedDegree}

主要星體：
${mainPlanets}

已知段落參考：
${chart.interpretation.sections.map((section) => `${section.title}：${section.body}`).join('\n')}
`
}

async function requestOpenAIJson(prompt: string) {
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
      text: {
        format: {
          type: 'json_schema',
          name: 'forecast_payload',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              summary: { type: 'string' },
              body: { type: 'string' },
              bullets: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 3,
              },
            },
            required: ['title', 'summary', 'body', 'bullets'],
          },
        },
      },
      reasoning: { effort: 'low' },
      max_output_tokens: 2200,
    }),
  })

  const payload = (await response.json()) as {
    error?: { message?: string }
    output_text?: string
    output?: Array<{
      content?: Array<{ text?: string }>
    }>
  }

  if (!response.ok) {
    throw new Error(payload.error?.message || 'OpenAI 預測生成失敗。')
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
    throw new Error('OpenAI 沒有回傳有效的預測內容。')
  }

  return JSON.parse(text) as GeneratedForecastContent
}

async function requestGeminiJson(prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2200,
        responseMimeType: 'application/json',
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
    throw new Error(payload.error?.message || 'Gemini 預測生成失敗。')
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim() || ''

  if (!text) {
    throw new Error('Gemini 沒有回傳有效的預測內容。')
  }

  return JSON.parse(text) as GeneratedForecastContent
}

async function generateForecastContent(chart: NatalChartResult, kind: ForecastWindow, periodKey: string) {
  const provider = getPreferredAiProvider()

  if (!provider) {
    throw new Error('目前尚未設定 AI API 金鑰，請先填入 .env 後再啟用年度 / 本周分析。')
  }

  const prompt = buildForecastPrompt(chart, kind, periodKey)

  if (provider === 'openai') {
    return {
      provider,
      content: await requestOpenAIJson(prompt),
    }
  }

  return {
    provider,
    content: await requestGeminiJson(prompt),
  }
}

async function tryFindStoredForecast(kind: ForecastKind, periodKey: string, locale: string, chartFingerprint: string) {
  try {
    return await prisma.forecastReport.findFirst({
      where: {
        kind,
        periodKey,
        locale,
        content: {
          path: ['chartFingerprint'],
          equals: chartFingerprint,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  } catch {
    return null
  }
}

async function tryStoreForecast(kind: ForecastKind, periodKey: string, locale: string, payload: StoredForecastContent) {
  try {
    const existing = await tryFindStoredForecast(kind, periodKey, locale, payload.chartFingerprint)

    if (existing) {
      await prisma.forecastReport.update({
        where: { id: existing.id },
        data: {
          status: ForecastStatus.READY,
          freePreview: payload.summary,
          content: payload,
          generatedAt: new Date(),
          availableAt: new Date(),
        },
      })
      return true
    }

    await prisma.forecastReport.create({
      data: {
        kind,
        periodKey,
        locale,
        timezone: 'Asia/Taipei',
        status: ForecastStatus.READY,
        freePreview: payload.summary,
        content: payload,
        generatedAt: new Date(),
        availableAt: new Date(),
      },
    })

    return true
  } catch {
    return false
  }
}

export async function getOrGenerateForecast({
  chart,
  force = false,
  kind,
  locale = 'zh-TW',
}: {
  chart: NatalChartResult
  force?: boolean
  kind: ForecastWindow
  locale?: string
}): Promise<ForecastPayload> {
  const periodKey = kind === 'yearly' ? getTaiwanYearKey() : getTaiwanWeekKey()
  const forecastKind = kind === 'yearly' ? ForecastKind.MONTHLY_PERSONAL : ForecastKind.WEEKLY_PERSONAL
  const chartFingerprint = buildChartFingerprint(chart)

  const existing = force ? null : await tryFindStoredForecast(forecastKind, periodKey, locale, chartFingerprint)
  const storedContent = existing?.content as StoredForecastContent | null

  if (
    existing &&
    storedContent &&
    typeof storedContent.title === 'string' &&
    typeof storedContent.summary === 'string' &&
    typeof storedContent.body === 'string' &&
    Array.isArray(storedContent.bullets)
  ) {
    return {
      kind,
      periodKey,
      title: storedContent.title,
      summary: storedContent.summary,
      body: storedContent.body,
      bullets: storedContent.bullets,
      generatedAt: existing.generatedAt?.toISOString() || existing.updatedAt.toISOString(),
      cached: true,
      stored: true,
      source: getPreferredAiProvider() || 'openai',
    }
  }

  const { provider, content } = await generateForecastContent(chart, kind, periodKey)
  const payload: StoredForecastContent = {
    chartFingerprint,
    title: content.title,
    summary: content.summary,
    body: content.body,
    bullets: content.bullets,
  }

  const stored = await tryStoreForecast(forecastKind, periodKey, locale, payload)

  return {
    kind,
    periodKey,
    title: payload.title,
    summary: payload.summary,
    body: payload.body,
    bullets: payload.bullets,
    generatedAt: new Date().toISOString(),
    cached: false,
    stored,
    source: provider,
  }
}
