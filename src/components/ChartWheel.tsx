import type { HousePlacement, PlanetPlacement } from '../types'

const SIGN_SHORT = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi']

const PLANET_SHORT: Record<string, string> = {
  sun: 'Su',
  moon: 'Mo',
  mercury: 'Me',
  venus: 'Ve',
  mars: 'Ma',
  jupiter: 'Ju',
  saturn: 'Sa',
  uranus: 'Ur',
  neptune: 'Ne',
  pluto: 'Pl',
}

function polar(center: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  }
}

export function ChartWheel({
  houses,
  planets,
  ascendantDegree,
  midheavenDegree,
}: {
  houses: HousePlacement[]
  planets: PlanetPlacement[]
  ascendantDegree: number
  midheavenDegree: number
}) {
  const size = 420
  const center = size / 2
  const outerRadius = 176
  const innerRadius = 116
  const labelRadius = 144
  const markerRadius = 160
  const rotation = 180 - ascendantDegree

  const majorPlanets = planets.filter((planet) => PLANET_SHORT[planet.key])

  return (
    <svg className="chart-wheel" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Natal chart wheel">
      <defs>
        <radialGradient id="wheelGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.88)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </radialGradient>
      </defs>

      <circle cx={center} cy={center} r={outerRadius} fill="url(#wheelGlow)" className="wheel-outer" />
      <circle cx={center} cy={center} r={innerRadius} className="wheel-inner" />
      <circle cx={center} cy={center} r={94} className="wheel-core" />

      {SIGN_SHORT.map((label, index) => {
        const angle = index * 30 + rotation
        const lineStart = polar(center, innerRadius, angle)
        const lineEnd = polar(center, outerRadius, angle)
        const labelPoint = polar(center, labelRadius, angle + 15)

        return (
          <g key={label}>
            <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} className="wheel-sign-line" />
            <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" className="wheel-sign-label">
              {label}
            </text>
          </g>
        )
      })}

      {houses.map((house) => {
        const angle = house.absDegree + rotation
        const edge = polar(center, outerRadius, angle)
        const numberPoint = polar(center, 84, angle + 8)

        return (
          <g key={house.number}>
            <line x1={center} y1={center} x2={edge.x} y2={edge.y} className="wheel-house-line" />
            <text x={numberPoint.x} y={numberPoint.y} textAnchor="middle" dominantBaseline="middle" className="wheel-house-label">
              {house.number}
            </text>
          </g>
        )
      })}

      {[{ label: 'ASC', degree: ascendantDegree }, { label: 'MC', degree: midheavenDegree }].map((point) => {
        const line = polar(center, outerRadius + 6, point.degree + rotation)
        const text = polar(center, outerRadius + 20, point.degree + rotation)

        return (
          <g key={point.label}>
            <line x1={center} y1={center} x2={line.x} y2={line.y} className="wheel-axis-line" />
            <text x={text.x} y={text.y} textAnchor="middle" dominantBaseline="middle" className="wheel-axis-label">
              {point.label}
            </text>
          </g>
        )
      })}

      {majorPlanets.map((planet, index) => {
        const point = polar(center, markerRadius - (index % 3) * 10, planet.absDegree + rotation)

        return (
          <g key={planet.key}>
            <circle cx={point.x} cy={point.y} r={10} className="wheel-planet-dot" />
            <text x={point.x} y={point.y} textAnchor="middle" dominantBaseline="middle" className="wheel-planet-label">
              {PLANET_SHORT[planet.key]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
