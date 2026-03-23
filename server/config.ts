import 'dotenv/config'

function trim(value: string | undefined) {
  return value?.trim() || undefined
}

export const config = {
  port: Number(process.env.PORT || 8787),
  nominatimEmail: trim(process.env.NOMINATIM_EMAIL),
  aiProvider: trim(process.env.AI_PROVIDER)?.toLowerCase(),
  openAiKey: trim(process.env.OPENAI_API_KEY),
  openAiModel: trim(process.env.OPENAI_MODEL) || 'gpt-5-mini',
  geminiKey: trim(process.env.GEMINI_API_KEY),
  geminiModel: trim(process.env.GEMINI_MODEL) || 'gemini-2.5-pro',
  emailDeliveryApiUrl: trim(process.env.EMAIL_DELIVERY_API_URL),
  emailDeliveryApiKey: trim(process.env.EMAIL_DELIVERY_API_KEY),
  forecastSchedulerEnabled: trim(process.env.FORECAST_SCHEDULER_ENABLED)?.toLowerCase() !== 'false',
  forecastSchedulerIntervalMs: Math.max(Number(process.env.FORECAST_SCHEDULER_INTERVAL_MS || 300000), 60000),
}

export function getPreferredAiProvider() {
  if (config.aiProvider === 'openai' && config.openAiKey) {
    return 'openai' as const
  }

  if (config.aiProvider === 'gemini' && config.geminiKey) {
    return 'gemini' as const
  }

  if (config.openAiKey) {
    return 'openai' as const
  }

  if (config.geminiKey) {
    return 'gemini' as const
  }

  return null
}
