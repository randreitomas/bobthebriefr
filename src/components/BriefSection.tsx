import type { ReactNode } from 'react'
import type { SectionKey } from '../types/brief'
import { BRIEF_SECTION_META, BriefSectionIcon } from '../lib/briefSections'

interface Props {
  section: SectionKey
  children: ReactNode
  onRegenerate: () => void
  isRegenerating: boolean
}

export function BriefSection({ section, children, onRegenerate, isRegenerating }: Props) {
  const { title } = BRIEF_SECTION_META[section]

  return (
    <article className="brief-section">
      <header className="section-header">
        <BriefSectionIcon section={section} />
        <div className="section-header-text">
          <h2 className="section-title">{title}</h2>
        </div>
        <button
          type="button"
          className="regen-btn"
          onClick={onRegenerate}
          disabled={isRegenerating}
          title={`Regenerate ${title}`}
        >
          {isRegenerating ? (
            <span className="regen-spinner" />
          ) : (
            '↻ Regenerate'
          )}
        </button>
      </header>
      <div className="section-body">
        {isRegenerating ? (
          <div className="section-regen-overlay">
            <span className="regen-spinner-lg" />
            <span>Regenerating…</span>
          </div>
        ) : (
          children
        )}
      </div>
    </article>
  )
}
