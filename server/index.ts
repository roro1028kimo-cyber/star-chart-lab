import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { z } from 'zod'
import { config, getPreferredAiProvider } from './config.js'
import { generateAiAdvice } from './services/ai.js'
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

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    aiConfigured: Boolean(getPreferredAiProvider()),
    aiProvider: getPreferredAiProvider(),
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
      error: error instanceof Error ? error.message : '地點搜尋失敗。',
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
      error: error instanceof Error ? error.message : '本命盤計算失敗。',
    })
  }
})

app.post('/api/insights/ai', async (request, response) => {
  const parsed = aiRequestSchema.safeParse(request.body)

  if (!parsed.success) {
    response.status(400).json({
      error: 'AI 建議請求格式不正確。',
    })
    return
  }

  if (!getPreferredAiProvider()) {
    response.status(503).json({
      error: '尚未設定 AI API key，請先填入 .env 後再啟用 AI 建議。',
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
      error: error instanceof Error ? error.message : 'AI 建議生成失敗。',
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

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist')
  app.use(express.static(distPath))
  app.get('*', (_request, response) => {
    response.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(config.port, () => {
  console.log(`Star Chart Lab server listening on http://localhost:${config.port}`)
})
