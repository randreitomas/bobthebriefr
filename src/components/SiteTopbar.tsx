import type { ReactNode } from 'react'

interface Props {
  onBrandClick?: () => void
  end?: ReactNode
}

export function SiteTopbar({ onBrandClick, end }: Props) {
  const brand = onBrandClick ? (
    <button type="button" className="site-brand" onClick={onBrandClick}>
      BobTheBriefr
    </button>
  ) : (
    <span className="site-brand site-brand--static" aria-current="page">
      BobTheBriefr
    </span>
  )

  return (
    <header className="site-topbar">
      <div className="site-topbar-inner">
        {brand}
        {end ? <div className="site-topbar-end">{end}</div> : null}
      </div>
    </header>
  )
}
