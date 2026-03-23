import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { z } from 'zod'
import { config, getPreferredAiProvider } from './config.js'
import { prisma } from './lib/prisma.js'
import { generateAiAdvice } from './services/ai.js'
import { getForecastHistory, getOrGenerateForecast } from './services/forecast.js'
import { startForecastScheduler } from './services/forecastScheduler.js'
import { searchPlaces } from './services/places.js'
import { calculateNatalChart } from './services/thoth.js'

const app = express()

const natalRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  placeLabel: z.string().min(2),
  city: z.string().min(1),
  countryCode: z.string().length(2),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
})

const aiRequestSchema = z.object({
  chart: z.any(),
})

const forecastRequestSchema = z.object({
  chart: z.any(),
  locale: z.string().optional(),
  force: z.boolean().optional(),
})

const forecastHistoryRequestSchema = z.object({
  chart: z.any(),
  locale: z.string().optional(),
  limit: z.number().int().min(1).max(12).optional(),
})

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', async (_request, response) => {
  const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim())
  let databaseConnected = false
  let databaseError: string | null = null

  if (databaseConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`
      databaseConnected = true
    } catch (error) {
      databaseError = error instanceof Error ? error.message : '資料庫連線檢查失敗。'
    }
  }

  response.json({
    ok: true,
    aiConfigured: Boolean(getPreferredAiProvider()),
    aiProvider: getPreferredAiProvider(),
    databaseConfigured,
    databaseConnected,
    databaseError,
    forecastSchedulerEnabled: config.forecastSchedulerEnabled,
    forecastSchedulerIntervalMs: config.forecastSchedulerIntervalMs,
  })
})

app.get('/api/places/search', async (request, response) => {
  const query = String(request.query.q || '').trim()

  if (query.length < 2) {
    response.json([])
    return
  }

  try {
    const suggestions = await searchPlaces(query)
    response.json(suggestions)
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : '地點搜尋暫時沒有回應。',
    })
  }
})

app.post('/api/charts/natal', async (request, response) => {
  const parsed = natalRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: '出生資料格式不正確。',
      details: parsed.error.flatten(),
    })
    return
  }

  try {
    const result = await calculateNatalChart(parsed.data)
    response.json(result)
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : '星盤計算失敗。',
    })
  }
})

app.post('/api/insights/ai', async (request, response) => {
  const parsed = aiRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: 'AI 解讀請求格式不正確。',
    })
    return
  }

  if (!getPreferredAiProvider()) {
    response.status(503).json({
      error: '尚未設定可用的 AI provider，請先確認 .env。',
    })
    return
  }

  try {
    const advice = await generateAiAdvice(parsed.data.chart)
    response.json({
      advice,
      provider: getPreferredAiProvider(),
    })
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : 'AI 解讀失敗。',
    })
  }
})

app.post('/api/premium/email', (_request, response) => {
  response.status(501).json({
    ok: false,
    ready: Boolean(config.emailDeliveryApiUrl && config.emailDeliveryApiKey),
    endpoint: config.emailDeliveryApiUrl || 'EMAIL_DELIVERY_API_URL',
    error: 'Email delivery API placeholder. Fill EMAIL_DELIVERY_API_URL and EMAIL_DELIVERY_API_KEY to connect it.',
  })
})

app.post('/api/forecasts/yearly', async (request, response) => {
  const parsed = forecastRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: '年度預測請求格式不正確。',
    })
    return
  }

  try {
    const result = await getOrGenerateForecast({
      chart: parsed.data.chart,
      force: parsed.data.force,
      kind: 'yearly',
      locale: parsed.data.locale || 'zh-TW',
    })

    response.json(result)
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : '年度預測生成失敗。',
    })
  }
})

app.post('/api/forecasts/yearly/history', async (request, response) => {
  const parsed = forecastHistoryRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: '年度預測歷史查詢格式不正確。',
    })
    return
  }

  try {
    const result = await getForecastHistory({
      chart: parsed.data.chart,
      kind: 'yearly',
      locale: parsed.data.locale || 'zh-TW',
      limit: parsed.data.limit,
    })

    response.json(result)
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : '年度預測歷史查詢失敗。',
    })
  }
})

app.post('/api/forecasts/weekly', async (request, response) => {
  const parsed = forecastRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: '本週運勢請求格式不正確。',
    })
    return
  }

  try {
    const result = await getOrGenerateForecast({
      chart: parsed.data.chart,
      force: parsed.data.force,
      kind: 'weekly',
      locale: parsed.data.locale || 'zh-TW',
    })

    response.json(result)
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : '本週運勢生成失敗。',
    })
  }
})

app.post('/api/forecasts/weekly/history', async (request, response) => {
  const parsed = forecastHistoryRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: '本週運勢歷史查詢格式不正確。',
    })
    return
  }

  try {
    const result = await getForecastHistory({
      chart: parsed.data.chart,
      kind: 'weekly',
      locale: parsed.data.locale || 'zh-TW',
      limit: parsed.data.limit,
    })

    response.json(result)
  } catch (error) {
    response.status(500).json({
      error: error instanceof Error ? error.message : '本週運勢歷史查詢失敗。',
    })
  }
})

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist')
  app.use(express.static(distPath))
  app.get('*', (_request, response) => {
    response.sendFile(path.join(distPath, 'index.html'))
  })
}

startForecastScheduler()

app.listen(config.port, () => {
  console.log(`Star Chart Lab server listening on http://localhost:${config.port}`)
})
