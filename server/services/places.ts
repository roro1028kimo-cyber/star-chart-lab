import { config } from '../config.js'
import type { PlaceSuggestion } from '../types.js'

interface NominatimAddress {
  city?: string
  town?: string
  village?: string
  municipality?: string
  county?: string
  state?: string
  country?: string
  country_code?: string
}

interface NominatimItem {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: NominatimAddress
  name?: string
}

function pickCity(item: NominatimItem) {
  const address = item.address
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.municipality ||
    address?.county ||
    item.name ||
    item.display_name.split(',')[0]
  )
}

export async function searchPlaces(query: string) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '6')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'zh-TW,en')
  url.searchParams.set('q', query)

  const userAgent = config.nominatimEmail
    ? `star-chart-lab/0.1 (${config.nominatimEmail})`
    : 'star-chart-lab/0.1'

  const response = await fetch(url, {
    headers: {
      'Accept-Language': 'zh-TW,en',
      'User-Agent': userAgent,
    },
  })

  if (!response.ok) {
    throw new Error(`地點搜尋失敗：${response.status}`)
  }

  const items = (await response.json()) as NominatimItem[]

  return items
    .map<PlaceSuggestion | null>((item) => {
      const city = pickCity(item)
      const country = item.address?.country
      const countryCode = item.address?.country_code?.toUpperCase()

      if (!city || !country || !countryCode) {
        return null
      }

      return {
        id: String(item.place_id),
        label: item.display_name,
        city,
        country,
        countryCode,
        lat: Number(item.lat),
        lon: Number(item.lon),
      }
    })
    .filter((item): item is PlaceSuggestion => Boolean(item))
}
