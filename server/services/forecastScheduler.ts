import { config } from '../config.js'
import { runDueForecastJobs } from './forecast.js'

let schedulerTimer: NodeJS.Timeout | null = null
let schedulerRunning = false

async function runSchedulerTick() {
  if (schedulerRunning) {
    return
  }

  schedulerRunning = true

  try {
    const result = await runDueForecastJobs()

    if (result.executed > 0) {
      console.log(
        `[forecast-scheduler] executed=${result.executed} succeeded=${result.succeeded} failed=${result.failed} skipped=${result.skipped}`,
      )
    }
  } catch (error) {
    console.error('[forecast-scheduler] tick failed', error)
  } finally {
    schedulerRunning = false
  }
}

export function startForecastScheduler() {
  if (schedulerTimer || !config.forecastSchedulerEnabled || !process.env.DATABASE_URL?.trim()) {
    return
  }

  void runSchedulerTick()

  schedulerTimer = setInterval(() => {
    void runSchedulerTick()
  }, config.forecastSchedulerIntervalMs)
}
