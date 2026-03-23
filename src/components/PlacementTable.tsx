import { APP_COPY, formatPlacementDegree } from '../content'
import type { NatalChartResult } from '../types'

const PLACEMENT_ORDER = [
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
] as const

type PlacementTableTheme = 'dark' | 'light'

type PlacementRow = {
  key: string
  label: string
  signLabel: string
  degreeLabel: string
  houseLabel: string
  retrograde: boolean
}

function buildRows(chart: NatalChartResult): PlacementRow[] {
  const sortIndex = new Map<string, number>(PLACEMENT_ORDER.map((key, index) => [key, index]))

  const orderedPlanets = [...chart.planets].sort((left, right) => {
    const leftIndex = sortIndex.get(left.key) ?? PLACEMENT_ORDER.length + 1
    const rightIndex = sortIndex.get(right.key) ?? PLACEMENT_ORDER.length + 1

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex
    }

    return left.absDegree - right.absDegree
  })

  return [
    ...orderedPlanets.map((planet) => ({
      key: planet.key,
      label: planet.label,
      signLabel: planet.signLabel,
      degreeLabel: formatPlacementDegree(planet.formattedDegree, planet.degree),
      houseLabel: planet.houseLabel,
      retrograde: planet.retrograde,
    })),
    {
      key: 'ascendant',
      label: APP_COPY.placementSpecial.ascendant,
      signLabel: chart.summary.ascendant.signLabel,
      degreeLabel: formatPlacementDegree(chart.summary.ascendant.formattedDegree, chart.summary.ascendant.degree),
      houseLabel: '1宮',
      retrograde: false,
    },
    {
      key: 'midheaven',
      label: APP_COPY.placementSpecial.midheaven,
      signLabel: chart.summary.midheaven.signLabel,
      degreeLabel: formatPlacementDegree(chart.summary.midheaven.formattedDegree, chart.summary.midheaven.degree),
      houseLabel: '10宮',
      retrograde: false,
    },
  ]
}

export function PlacementTable({
  chart,
  theme = 'dark',
}: {
  chart: NatalChartResult
  theme?: PlacementTableTheme
}) {
  const rows = buildRows(chart)

  return (
    <div className={`placement-table placement-table--${theme}`}>
      <div className="placement-table__scroll">
        <table>
          <thead>
            <tr>
              <th>{APP_COPY.placementColumns.body}</th>
              <th>{APP_COPY.placementColumns.sign}</th>
              <th>{APP_COPY.placementColumns.degree}</th>
              <th>{APP_COPY.placementColumns.house}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="placement-table__body">
                  <span>{row.label}</span>
                  {row.retrograde && <small>R</small>}
                </td>
                <td>{row.signLabel}</td>
                <td>{row.degreeLabel}</td>
                <td>{row.houseLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
