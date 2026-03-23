import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

export function RevealSection({
  children,
  className,
  delay = 0,
  id,
}: {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (isVisible) {
      return
    }

    const node = ref.current

    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.18,
      },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [isVisible])

  return (
    <section
      id={id}
      ref={ref}
      className={`reveal-section ${isVisible ? 'is-visible' : ''} ${className || ''}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </section>
  )
}
