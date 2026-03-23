import horoscopePkg from 'circular-natal-horoscope-js'
import { getPreferredAiProvider } from '../config.js'
import type {
  AspectSummary,
  HousePlacement,
  NatalChartInput,
  NatalChartResult,
  PlanetPlacement,
} from '../types.js'
import { buildInterpretation } from './interpretation.js'

const { Origin, Horoscope } = horoscopePkg as {
  Origin: new (options: {
    year: number
    month: number
    date: number
    hour: number
    minute: number
    latitude: number
    longitude: number
  }) => unknown
  Horoscope: new (options: {
    origin: unknown
    houseSystem: string
    zodiac: string
    aspectPoints: string[]
    aspectWithPoints: string[]
    aspectTypes: string[]
    customOrbs: Record<string, number>
    language: string
  }) => HoroscopeResult
}

type HoroscopeHouseRef = {
  id: number
  label: string
}

type HoroscopePoint = {
  key: string
  label: string
  Sign: {
    key: string
    label: string
  }
  ChartPosition: {
    Ecliptic: {
      DecimalDegrees: number
      ArcDegreesFormatted30: string
    }
  }
}

type HoroscopeBody = HoroscopePoint & {
  House?: HoroscopeHouseRef
  isRetrograde?: boolean
}

type SupportedHoroscopeBody = HoroscopeBody & {
  House: HoroscopeHouseRef
}

type HoroscopeAspect = {
  point1Key: string
  point1Label: string
  point2Key: string
  point2Label: string
  aspectKey: string
  label: string
  orb: number
}

type HoroscopeResult = {
  Ascendant: HoroscopePoint
  Midheaven: HoroscopePoint
  CelestialBodies: {
    all: HoroscopeBody[]
  }
  CelestialPoints: {
    all: HoroscopeBody[]
  }
  Houses: Array<{
    id: number
    label: string
    Sign: {
      key: string
      label: string
    }
    ChartPosition: {
      StartPosition: {
        Ecliptic: {
          DecimalDegrees: number
          ArcDegreesFormatted30: string
        }
      }
    }
  }>
  Aspects: {
    all: HoroscopeAspect[]
  }
}

const SIGN_LABELS: Record<string, string> = {
  aries: '牡羊座',
  taurus: '金牛座',
  gemini: '雙子座',
  cancer: '巨蟹座',
  leo: '獅子座',
  virgo: '處女座',
  libra: '天秤座',
  scorpio: '天蠍座',
  sagittarius: '射手座',
  capricorn: '摩羯座',
  aquarius: '水瓶座',
  pisces: '雙魚座',
}

const SIGN_META: Record<string, { element: string; modality: string; short: string }> = {
  aries: { element: 'Fire', modality: 'Cardinal', short: 'Ari' },
  taurus: { element: 'Earth', modality: 'Fixed', short: 'Tau' },
  gemini: { element: 'Air', modality: 'Mutable', short: 'Gem' },
  cancer: { element: 'Water', modality: 'Cardinal', short: 'Can' },
  leo: { element: 'Fire', modality: 'Fixed', short: 'Leo' },
  virgo: { element: 'Earth', modality: 'Mutable', short: 'Vir' },
  libra: { element: 'Air', modality: 'Cardinal', short: 'Lib' },
  scorpio: { element: 'Water', modality: 'Fixed', short: 'Sco' },
  sagittarius: { element: 'Fire', modality: 'Mutable', short: 'Sag' },
  capricorn: { element: 'Earth', modality: 'Cardinal', short: 'Cap' },
  aquarius: { element: 'Air', modality: 'Fixed', short: 'Aqu' },
  pisces: { element: 'Water', modality: 'Mutable', short: 'Pis' },
}

const PLANET_LABELS: Record<string, string> = {
  sun: '太陽',
  moon: '月亮',
  mercury: '水星',
  venus: '金星',
  mars: '火星',
  jupiter: '木星',
  saturn: '土星',
  uranus: '天王星',
  neptune: '海王星',
  pluto: '冥王星',
  chiron: '凱龍星',
  northnode: '北交點',
  southnode: '南交點',
  lilith: '黑月莉莉絲',
}

const SUPPORTED_BODY_KEYS = new Set([
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'chiron',
  'northnode',
  'southnode',
  'lilith',
])

const SUPPORTED_ASPECT_KEYS = new Set([...SUPPORTED_BODY_KEYS, 'ascendant', 'midheaven'])

const DOMINANT_BODY_KEYS = new Set([
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
])

function parseDateInput(value: string) {
  const [year, month, date] = value.split('-').map(Number)
  return { year, month: month - 1, date }
}

function parseTimeInput(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return { hour, minute }
}

function toSignDegree(decimalDegree: number) {
  const value = decimalDegree % 30
  return value < 0 ? value + 30 : value
}

function toShortSign(signKey: string) {
  return SIGN_META[signKey]?.short || signKey.slice(0, 3)
}

function toChineseSign(signKey: string, fallbackLabel: string) {
  return SIGN_LABELS[signKey] || fallbackLabel
}

function getHouseLabel(houseNumber: number) {
  return `第${houseNumber}宮`
}

function isSupportedBody(body: HoroscopeBody): body is SupportedHoroscopeBody {
  return SUPPORTED_BODY_KEYS.has(body.key) && Boolean(body.House)
}

function isSupportedAspect(aspect: HoroscopeAspect) {
  return SUPPORTED_ASPECT_KEYS.has(aspect.point1Key) && SUPPORTED_ASPECT_KEYS.has(aspect.point2Key)
}

function normalizeBody(body: SupportedHoroscopeBody): PlanetPlacement {
  return {
    key: body.key,
    label: PLANET_LABELS[body.key] || body.label,
    sign: toShortSign(body.Sign.key),
    signLabel: toChineseSign(body.Sign.key, body.Sign.label),
    degree: toSignDegree(body.ChartPosition.Ecliptic.DecimalDegrees),
    absDegree: body.ChartPosition.Ecliptic.DecimalDegrees,
    house: body.House.id,
    houseLabel: getHouseLabel(body.House.id),
    retrograde: Boolean(body.isRetrograde),
  }
}

function normalizeHouse(house: HoroscopeResult['Houses'][number]): HousePlacement {
  return {
    number: house.id,
    sign: toShortSign(house.Sign.key),
    signLabel: toChineseSign(house.Sign.key, house.Sign.label),
    degree: toSignDegree(house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees),
    absDegree: house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees,
  }
}

function normalizeAspect(aspect: HoroscopeAspect): AspectSummary {
  return {
    planet1: PLANET_LABELS[aspect.point1Key] || aspect.point1Label,
    planet2: PLANET_LABELS[aspect.point2Key] || aspect.point2Label,
    aspect: aspect.aspectKey || aspect.label.toLowerCase(),
    orb: aspect.orb,
  }
}

function pickDominant(record: Record<string, number>) {
  return Object.entries(record).sort((left, right) => right[1] - left[1])[0]
}

function countElements(planets: PlanetPlacement[]) {
  return planets.reduce<Record<string, number>>((accumulator, planet) => {
    const meta = Object.values(SIGN_META).find((item) => item.short === planet.sign)

    if (meta) {
      accumulator[meta.element] = (accumulator[meta.element] || 0) + 1
    }

    return accumulator
  }, {})
}

function countModalities(planets: PlanetPlacement[]) {
  return planets.reduce<Record<string, number>>((accumulator, planet) => {
    const meta = Object.values(SIGN_META).find((item) => item.short === planet.sign)

    if (meta) {
      accumulator[meta.modality] = (accumulator[meta.modality] || 0) + 1
    }

    return accumulator
  }, {})
}

export async function calculateNatalChart(input: NatalChartInput): Promise<NatalChartResult> {
  const { year, month, date } = parseDateInput(input.date)
  const { hour, minute } = parseTimeInput(input.time)

  const origin = new Origin({
    year,
    month,
    date,
    hour,
    minute,
    latitude: input.lat,
    longitude: input.lon,
  })

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major'],
    customOrbs: {},
    language: 'en',
  })

  const planets = [...horoscope.CelestialBodies.all, ...horoscope.CelestialPoints.all]
    .filter(isSupportedBody)
    .map(normalizeBody)

  const houses = horoscope.Houses.map(normalizeHouse).sort((left, right) => left.number - right.number)
  const aspects = horoscope.Aspects.all
    .filter(isSupportedAspect)
    .map(normalizeAspect)
    .sort((left, right) => left.orb - right.orb)

  const sun = planets.find((planet) => planet.key === 'sun')
  const moon = planets.find((planet) => planet.key === 'moon')

  if (!sun || !moon) {
    throw new Error('系統無法從命盤結果中取得太陽與月亮資料。')
  }

  const dominantPlanets = planets.filter((planet) => DOMINANT_BODY_KEYS.has(planet.key))
  const elementStats = countElements(dominantPlanets)
  const modalityStats = countModalities(dominantPlanets)
  const dominantElement = pickDominant(elementStats)
  const dominantModality = pickDominant(modalityStats)

  const summary = {
    sun,
    moon,
    ascendant: {
      sign: toShortSign(horoscope.Ascendant.Sign.key),
      signLabel: toChineseSign(horoscope.Ascendant.Sign.key, horoscope.Ascendant.Sign.label),
      degree: toSignDegree(horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees),
      absDegree: horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees,
    },
    midheaven: {
      sign: toShortSign(horoscope.Midheaven.Sign.key),
      signLabel: toChineseSign(horoscope.Midheaven.Sign.key, horoscope.Midheaven.Sign.label),
      degree: toSignDegree(horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees),
      absDegree: horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees,
    },
    dominantElement: dominantElement?.[0] || 'Earth',
    dominantElementCount: dominantElement?.[1] || 0,
    dominantModality: dominantModality?.[0] || 'Cardinal',
    dominantModalityCount: dominantModality?.[1] || 0,
  }

  return {
    input,
    source: {
      engine: 'circular-natal-horoscope-js',
      geocoding: 'Nominatim + built-in timezone derivation',
      aiConfigured: Boolean(getPreferredAiProvider()),
      aiProvider: getPreferredAiProvider(),
    },
    summary,
    planets,
    houses,
    aspects,
    interpretation: buildInterpretation({
      input,
      summary,
      planets,
      aspects,
    }),
  }
}
