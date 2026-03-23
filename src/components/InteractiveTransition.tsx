import { useState, type CSSProperties, type PointerEvent } from 'react'

type Burst = {
  id: number
  x: number
  y: number
}

export function InteractiveTransition({
  hint,
  lead,
  title,
  variant,
}: {
  hint: string
  lead: string
  title: string
  variant: 'entry' | 'premium'
}) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [bursts, setBursts] = useState<Burst[]>([])

  function updatePointer(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2

    setPointer({
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
    })
  }

  function resetPointer() {
    setPointer({ x: 0, y: 0 })
  }

  function spawnBurst(event: PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    const burst = { id: Date.now(), x, y }

    setBursts((current) => [...current, burst])
    window.setTimeout(() => {
      setBursts((current) => current.filter((item) => item.id !== burst.id))
    }, 900)
  }

  return (
    <main
      className={`transition-view transition-view--${variant}`}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
      onPointerDown={spawnBurst}
      style={
        {
          '--pointer-x': pointer.x,
          '--pointer-y': pointer.y,
        } as CSSProperties
      }
    >
      <div className="transition-copy">
        <span className="eyebrow">Interactive Transition</span>
        <h1>{title}</h1>
        <p>{lead}</p>
        <small>{hint}</small>
      </div>

      <div className="interactive-scene" aria-hidden="true">
        <div className="scene-halo" />
        <div className="scene-grid" />
        <div className="scene-beam" />
        <div className="scene-orb scene-orb--one" />
        <div className="scene-orb scene-orb--two" />
        <div className="scene-orb scene-orb--three" />
        <div className="scene-ring scene-ring--outer" />
        <div className="scene-ring scene-ring--inner" />
        <div className="scene-core" />
        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="scene-burst"
            style={
              {
                left: `${burst.x}%`,
                top: `${burst.y}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </main>
  )
}
