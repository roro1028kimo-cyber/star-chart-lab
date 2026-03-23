import crypto from 'node:crypto'
import { ForecastKind, ForecastStatus, type ForecastJob, type ForecastReport, type Prisma } from '@prisma/client'
import { config, getPreferredAiProvider } from '../config.js'
import { prisma } from '../lib/prisma.js'
import type { NatalChartResult } from '../types.js'

const TAIPEI_TIMEZONE = 'Asia/Taipei'
const DEFAULT_HISTORY_LIMIT = 6
const SCHEDULED_RUN_MINUTE = 5

export type ForecastWindow = 'yearly' | 'weekly'
export type ForecastSource = 'openai' | 'gemini'

type StoredForecastContent = {
  chartFingerprint: string
  title: string
  summary: string
  body: string
  bullets: string[]
  source?: ForecastSource
}

type GeneratedForecastContent = {
  title: string
  summary: string
  body: string
  bullets: string[]
}

type ScheduledForecastPayload = {
  chartFingerprint: string
  chart: NatalChartResult
  locale: string
}

export type ForecastPayload = {
  kind: ForecastWindow
  periodKey: string
  title: string
  summary: string
  body: string
  bullets: string[]
  generatedAt: string
  cached: boolean
  stored: boolean
  source: ForecastSource
}

export type ForecastHistoryEntry = {
  id: string
  kind: ForecastWindow
  periodKey: string
  title: string
  summary: string
  body: string
  bullets: string[]
  generatedAt: string
  availableAt: string | null
  source: ForecastSource
}

export type ForecastJobRunResult = {
  executed: number
  succeeded: number
  failed: number
  skipped: number
}

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim())
}

function getTaipeiDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TAIPEI_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const read = (type: string, fallback: string) => parts.find((part) => part.type === type)?.value || fallback

  return {
    year: Number(read('year', '2000')),
    month: Number(read('month', '01')),
    day: Number(read('day', '01')),
    hour: Number(read('hour', '00')),
    minute: Number(read('minute', '00')),
    second: Number(read('second', '00')),
  }
}

function createTaipeiDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second))
}

function formatParts(year: number, month: number, day: number) {
  return [year, String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-')
}

function getTaipeiWeekStart(date = new Date()) {
  const parts = getTaipeiDateParts(date)
  const current = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  const weekday = current.getUTCDay()
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday
  current.setUTCDate(current.getUTCDate() + diffToMonday)

  return {
    year: current.getUTCFullYear(),
    month: current.getUTCMonth() + 1,
    day: current.getUTCDate(),
  }
}

function getCurrentPeriodKey(kind: ForecastWindow, date = new Date()) {
  if (kind === 'yearly') {
    return String(getTaipeiDateParts(date).year)
  }

  const weekStart = getTaipeiWeekStart(date)
  return formatParts(weekStart.year, weekStart.month, weekStart.day)
}

function getNextScheduledRun(kind: ForecastWindow, date = new Date()) {
  if (kind === 'yearly') {
    const nextYear = getTaipeiDateParts(date).year + 1

    return {
      periodKey: String(nextYear),
      runAt: createTaipeiDate(nextYear, 1, 1, 0, SCHEDULED_RUN_MINUTE),
    }
  }

  const weekStart = getTaipeiWeekStart(date)
  const nextWeekStart = new Date(Date.UTC(weekStart.year, weekStart.month - 1, weekStart.day))
  nextWeekStart.setUTCDate(nextWeekStart.getUTCDate() + 7)

  const nextYear = nextWeekStart.getUTCFullYear()
  const nextMonth = nextWeekStart.getUTCMonth() + 1
  const nextDay = nextWeekStart.getUTCDate()

  return {
    periodKey: formatParts(nextYear, nextMonth, nextDay),
    runAt: createTaipeiDate(nextYear, nextMonth, nextDay, 0, SCHEDULED_RUN_MINUTE),
  }
}

function mapWindowToForecastKind(kind: ForecastWindow) {
  return kind === 'weekly' ? ForecastKind.WEEKLY_PERSONAL : ForecastKind.MONTHLY_PERSONAL
}

function mapForecastKindToWindow(kind: ForecastKind): ForecastWindow {
  return kind === ForecastKind.WEEKLY_PERSONAL ? 'weekly' : 'yearly'
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

function normalizeBullets(bullets: unknown) {
  if (!Array.isArray(bullets)) {
    return []
  }

  return bullets
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 3)
}

function readStoredContent(report: ForecastReport) {
  const content = report.content as StoredForecastContent | null

  if (!content) {
    return null
  }

  const bullets = normalizeBullets(content.bullets)

  if (
    typeof content.chartFingerprint !== 'string' ||
    typeof content.title !== 'string' ||
    typeof content.summary !== 'string' ||
    typeof content.body !== 'string' ||
    bullets.length === 0
  ) {
    return null
  }

  return {
    chartFingerprint: content.chartFingerprint,
    title: content.title,
    summary: content.summary,
    body: content.body,
    bullets,
    source: content.source === 'gemini' ? 'gemini' : 'openai',
  } satisfies StoredForecastContent
}

function mapReportToHistoryEntry(report: ForecastReport): ForecastHistoryEntry | null {
  const content = readStoredContent(report)

  if (!content) {
    return null
  }

  return {
    id: report.id,
    kind: mapForecastKindToWindow(report.kind),
    periodKey: report.periodKey,
    title: content.title,
    summary: content.summary,
    body: content.body,
    bullets: content.bullets,
    generatedAt: report.generatedAt?.toISOString() || report.updatedAt.toISOString(),
    availableAt: report.availableAt?.toISOString() || null,
    source: content.source || getPreferredAiProvider() || 'openai',
  }
}

function buildForecastPrompt(chart: NatalChartResult, kind: ForecastWindow, periodKey: string) {
  const keyPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']
    .map((key) => chart.planets.find((planet) => planet.key === key))
    .filter((planet): planet is NonNullable<typeof planet> => Boolean(planet))
    .map(
      (planet) =>
        `${planet.label}：${planet.signLabel}，${planet.houseLabel}，${planet.formattedDegree}${planet.retrograde ? '，逆行' : ''}`,
    )
    .join('\n')

  const dossierSections = chart.interpretation.sections.map((section) => `${section.title}：${section.body}`).join('\n')
  const scope =
    kind === 'yearly'
      ? `請寫出 ${periodKey} 年的個人年度重點，強調年度節奏、關係推進、工作與金錢主題。`
      : `請寫出 ${periodKey} 這一週的個人週運，強調本週最該注意的機會、情緒節點與互動提醒。`

  return [
    '你是一位懂西洋占星，也懂產品文案節奏的分析師。',
    '請用繁體中文輸出，口吻要輕鬆、帶專業感，像朋友在提醒，但不能空泛。',
    '內容要建立閱讀慾望，讓人想繼續往下看，同時保持具體。',
    '不要提到你是 AI，不要出現免責聲明，也不要把內容寫成工作報告。',
    '回傳格式必須是 JSON，欄位固定為 title、summary、body、bullets。',
    'summary 控制在 80 到 160 字，body 控制在 500 到 1400 字，bullets 固定 3 則。',
    'bullets 每則都要是可以快速掃讀的短句。',
    scope,
    '',
    '出生資料：',
    `- 出生日期：${chart.input.date}`,
    `- 出生時間：${chart.input.time}`,
    `- 出生地點：${chart.input.placeLabel}`,
    '',
    '命盤摘要：',
    `- 主標：${chart.interpretation.headline}`,
    `- 副標：${chart.interpretation.subheadline}`,
    `- 主元素 / 模式：${chart.summary.dominantElement} / ${chart.summary.dominantModality}`,
    `- 上升：${chart.summary.ascendant.signLabel} ${chart.summary.ascendant.formattedDegree}`,
    `- 天頂：${chart.summary.midheaven.signLabel} ${chart.summary.midheaven.formattedDegree}`,
    '',
    '主要星體：',
    keyPlanets,
    '',
    '既有解讀參考：',
    dossierSections,
  ].join('\n')
}

function parseJsonPayload<T>(rawText: string) {
  const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(cleaned) as T
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
          content: [{ type: 'input_text', text: prompt }],
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
      max_output_tokens: 2600,
    }),
  })

  const payload = (await response.json()) as {
    error?: { message?: string }
    output_text?: string
    output?: Array<{ content?: Array<{ text?: string }> }>
  }

  if (!response.ok) {
    throw new Error(payload.error?.message || 'OpenAI forecast generation failed.')
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
    throw new Error('OpenAI did not return forecast content.')
  }

  return parseJsonPayload<GeneratedForecastContent>(text)
}

async function requestGeminiJson(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2600,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  const payload = (await response.json()) as {
    error?: { message?: string }
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  if (!response.ok) {
    throw new Error(payload.error?.message || 'Gemini forecast generation failed.')
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim() || ''

  if (!text) {
    throw new Error('Gemini did not return forecast content.')
  }

  return parseJsonPayload<GeneratedForecastContent>(text)
}

async function generateForecastContent(chart: NatalChartResult, kind: ForecastWindow, periodKey: string) {
  const provider = getPreferredAiProvider()

  if (!provider) {
    throw new Error('尚未設定可用的 AI provider，請先確認 .env 的 API 設定。')
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
  if (!hasDatabase()) {
    return null
  }

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
      orderBy: [{ generatedAt: 'desc' }, { updatedAt: 'desc' }],
    })
  } catch {
    return null
  }
}

async function tryStoreForecast(kind: ForecastKind, periodKey: string, locale: string, payload: StoredForecastContent) {
  if (!hasDatabase()) {
    return false
  }

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
          updatedAt: new Date(),
        },
      })

      return true
    }

    await prisma.forecastReport.create({
      data: {
        kind,
        periodKey,
        locale,
        timezone: TAIPEI_TIMEZONE,
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

async function findPendingForecastJob(kind: ForecastKind, periodKey: string, locale: string, chartFingerprint: string) {
  if (!hasDatabase()) {
    return null
  }

  try {
    return await prisma.forecastJob.findFirst({
      where: {
        kind,
        periodKey,
        locale,
        status: ForecastStatus.PENDING,
        payload: {
          path: ['chartFingerprint'],
          equals: chartFingerprint,
        },
      },
      orderBy: [{ runAt: 'asc' }, { createdAt: 'asc' }],
    })
  } catch {
    return null
  }
}

function readScheduledPayload(job: ForecastJob) {
  const payload = job.payload as ScheduledForecastPayload | null

  if (!payload || typeof payload.chartFingerprint !== 'string' || !payload.chart || typeof payload.locale !== 'string') {
    return null
  }

  return payload
}

async function ensureScheduledForecastJob(chart: NatalChartResult, kind: ForecastWindow, locale: string) {
  if (!hasDatabase()) {
    return false
  }

  const chartFingerprint = buildChartFingerprint(chart)
  const forecastKind = mapWindowToForecastKind(kind)
  const schedule = getNextScheduledRun(kind)
  const existing = await findPendingForecastJob(forecastKind, schedule.periodKey, locale, chartFingerprint)

  if (existing) {
    return false
  }

  try {
    await prisma.forecastJob.create({
      data: {
        kind: forecastKind,
        periodKey: schedule.periodKey,
        locale,
        timezone: TAIPEI_TIMEZONE,
        runAt: schedule.runAt,
        status: ForecastStatus.PENDING,
        payload: {
          chartFingerprint,
          chart,
          locale,
        } as unknown as Prisma.InputJsonValue,
      },
    })

    return true
  } catch {
    return false
  }
}

async function ensureForecastJobs(chart: NatalChartResult, locale: string) {
  await Promise.all([
    ensureScheduledForecastJob(chart, 'yearly', locale),
    ensureScheduledForecastJob(chart, 'weekly', locale),
  ])
}

export async function getForecastHistory({
  chart,
  kind,
  limit = DEFAULT_HISTORY_LIMIT,
  locale = 'zh-TW',
}: {
  chart: NatalChartResult
  kind: ForecastWindow
  limit?: number
  locale?: string
}): Promise<ForecastHistoryEntry[]> {
  if (!hasDatabase()) {
    return []
  }

  const chartFingerprint = buildChartFingerprint(chart)
  const forecastKind = mapWindowToForecastKind(kind)

  try {
    const reports = await prisma.forecastReport.findMany({
      where: {
        kind: forecastKind,
        locale,
        content: {
          path: ['chartFingerprint'],
          equals: chartFingerprint,
        },
      },
      orderBy: [{ generatedAt: 'desc' }, { updatedAt: 'desc' }],
      take: Math.max(1, Math.min(limit, 12)),
    })

    return reports.map(mapReportToHistoryEntry).filter((entry): entry is ForecastHistoryEntry => Boolean(entry))
  } catch {
    return []
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
  const periodKey = getCurrentPeriodKey(kind)
  const forecastKind = mapWindowToForecastKind(kind)
  const chartFingerprint = buildChartFingerprint(chart)

  const existing = force ? null : await tryFindStoredForecast(forecastKind, periodKey, locale, chartFingerprint)
  const storedContent = existing ? readStoredContent(existing) : null

  if (existing && storedContent) {
    await ensureForecastJobs(chart, locale)

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
      source: storedContent.source || getPreferredAiProvider() || 'openai',
    }
  }

  const { provider, content } = await generateForecastContent(chart, kind, periodKey)
  const payload: StoredForecastContent = {
    chartFingerprint,
    title: content.title,
    summary: content.summary,
    body: content.body,
    bullets: normalizeBullets(content.bullets),
    source: provider,
  }

  const stored = await tryStoreForecast(forecastKind, periodKey, locale, payload)
  await ensureForecastJobs(chart, locale)

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

export async function runDueForecastJobs(limit = 10): Promise<ForecastJobRunResult> {
  if (!hasDatabase()) {
    return {
      executed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
    }
  }

  const dueJobs = await prisma.forecastJob.findMany({
    where: {
      status: ForecastStatus.PENDING,
      runAt: {
        lte: new Date(),
      },
    },
    orderBy: [{ runAt: 'asc' }, { createdAt: 'asc' }],
    take: Math.max(1, Math.min(limit, 20)),
  })

  let succeeded = 0
  let failed = 0
  let skipped = 0

  for (const job of dueJobs) {
    const window = mapForecastKindToWindow(job.kind)
    const payload = readScheduledPayload(job)

    if (!payload) {
      skipped += 1
      await prisma.forecastJob.update({
        where: { id: job.id },
        data: {
          status: ForecastStatus.FAILED,
          errorMessage: 'Missing or invalid job payload.',
        },
      })
      continue
    }

    try {
      const forecast = await getOrGenerateForecast({
        chart: payload.chart,
        force: true,
        kind: window,
        locale: payload.locale || job.locale,
      })

      const report = await tryFindStoredForecast(job.kind, forecast.periodKey, payload.locale || job.locale, payload.chartFingerprint)

      await prisma.forecastJob.update({
        where: { id: job.id },
        data: {
          status: ForecastStatus.READY,
          errorMessage: null,
          forecastReportId: report?.id,
          payload: {
            ...payload,
            lastGeneratedAt: forecast.generatedAt,
            lastPeriodKey: forecast.periodKey,
            lastSource: forecast.source,
          } as unknown as Prisma.InputJsonValue,
        },
      })

      succeeded += 1
    } catch (error) {
      failed += 1
      await prisma.forecastJob.update({
        where: { id: job.id },
        data: {
          status: ForecastStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Forecast job failed.',
        },
      })

      await ensureScheduledForecastJob(payload.chart, window, payload.locale || job.locale)
    }
  }

  return {
    executed: dueJobs.length,
    succeeded,
    failed,
    skipped,
  }
}
