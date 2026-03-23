export interface PlaceSuggestion {
  id: string
  label: string
  city: string
  country: string
  countryCode: string
  lat: number
  lon: number
}

export interface PlanetPlacement {
  key: string
  label: string
  sign: string
  signLabel: string
  degree: number
  formattedDegree: string
  absDegree: number
  house: number
  houseLabel: string
  retrograde: boolean
}

export interface HousePlacement {
  number: number
  sign: string
  signLabel: string
  degree: number
  formattedDegree: string
  absDegree: number
}

export interface AspectSummary {
  planet1: string
  planet2: string
  aspect: string
  orb: number
}

export interface InterpretationBlock {
  title: string
  body: string
}

export type DashboardSection = 'yearly' | 'weekly' | 'houses' | 'settings' | 'vip'

export interface ForecastResponse {
  kind: 'yearly' | 'weekly'
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

export interface NatalChartResult {
  input: {
    date: string
    time: string
    placeLabel: string
    city: string
    countryCode: string
    lat: number
    lon: number
  }
  source: {
    engine: string
    geocoding: string
    aiConfigured: boolean
    aiProvider: string | null
  }
  summary: {
    sun: PlanetPlacement
    moon: PlanetPlacement
    ascendant: {
      sign: string
      signLabel: string
      degree: number
      formattedDegree: string
      absDegree: number
    }
    midheaven: {
      sign: string
      signLabel: string
      degree: number
      formattedDegree: string
      absDegree: number
    }
    dominantElement: string
    dominantElementCount: number
    dominantModality: string
    dominantModalityCount: number
  }
  planets: PlanetPlacement[]
  houses: HousePlacement[]
  aspects: AspectSummary[]
  interpretation: {
    headline: string
    subheadline: string
    keywords: string[]
    highlights: string[]
    freeReading: string
    premiumTeaser: string
    sections: InterpretationBlock[]
  }
}
