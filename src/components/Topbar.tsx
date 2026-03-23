import { APP_COPY } from '../content'

export function Topbar() {
  return (
    <header className="site-topbar">
      <div className="brand-lockup">
        <span className="brand-mark">SCL</span>
        <div className="brand-copy">
          <span className="eyebrow">{APP_COPY.eyebrow}</span>
          <strong>{APP_COPY.brand}</strong>
        </div>
      </div>
    </header>
  )
}
