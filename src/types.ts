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
  absDegree: number
}

export interface AspectSummary {
  planet1: string
  planet2: string
  aspect: string
  orb: number
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
      absDegree: number
    }
    midheaven: {
      sign: string
      signLabel: string
      degree: number
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
    sections: Array<{
      title: string
      body: string
    }>
  }
}

export interface HealthResponse {
  ok: boolean
  aiConfigured: boolean
  aiProvider: string | null
}

export interface AiInsightsResponse {
  advice: string
  provider: string | null
}

export interface PremiumEmailPlaceholderResponse {
  ok: boolean
  ready: boolean
  endpoint: string
  error: string
}
