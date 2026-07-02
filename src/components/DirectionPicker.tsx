import { useState, type CSSProperties } from 'react'
import type { BriefDirection } from '../types/brief'
import { BriefSectionIcon, BRIEF_SECTION_META } from '../lib/briefSections'
import { DIRECTION_META } from '../lib/directionMeta'
import { ColorPalette } from './ColorPalette'

interface Props {
  eventName: string
  directions: BriefDirection[]
  isMerging: boolean
  onSelectOne: (dir: BriefDirection) => void
  onMerge: (dirA: BriefDirection, dirB: BriefDirection) => void
  onStartOver: () => void
}

export function DirectionPicker({
  eventName,
  directions,
  isMerging,
  onSelectOne,
  onMerge,
  onStartOver,
}: Props) {
  const [selected, setSelected] = useState<Set<'A' | 'B' | 'C'>>(new Set())

  function toggle(id: 'A' | 'B' | 'C') {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 2) {
        next.add(id)
      }
      return next
    })
  }

  const selectedDirs = directions.filter(d => selected.has(d.id))
  const canMerge = selected.size === 2
  const canPickOne = selected.size === 1

  return (
    <div className="directions-page">
      <header className="directions-toolbar">
        <div className="brief-title-block">
          <p className="form-eyebrow">Pick a direction</p>
          <h1 className="brief-page-title">{eventName}</h1>
          <p className="directions-lead">
            Three creative angles generated in parallel. Select one to continue, or choose two to merge.
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={onStartOver}>
          ← New Brief
        </button>
      </header>

      <div className="picker-hints" role="list">
        <div className="picker-hint" role="listitem">
          <span className="picker-hint-num">1</span>
          <span>Select <strong>one</strong> direction to use it as your brief</span>
        </div>
        <div className="picker-hint" role="listitem">
          <span className="picker-hint-num">2</span>
          <span>Select <strong>two</strong> to merge the strongest ideas from both</span>
        </div>
      </div>

      <div className="picker-grid">
        {directions.map(dir => {
          const isSelected = selected.has(dir.id)
          const selectionOrder = isSelected ? [...selected].indexOf(dir.id) + 1 : null
          const meta = DIRECTION_META[dir.id]

          return (
            <article
              key={dir.id}
              className={`direction-card direction-card--${dir.id.toLowerCase()} ${isSelected ? 'direction-card--selected' : ''}`}
              onClick={() => toggle(dir.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggle(dir.id)
                }
              }}
              aria-pressed={isSelected}
              aria-label={`Direction ${dir.id}: ${dir.label}. ${isSelected ? 'Selected' : 'Click to select'}.`}
              style={{ '--direction-accent': meta.accent, '--direction-bg': meta.iconBg } as CSSProperties}
            >
              <header className="direction-card-header">
                <div className="direction-card-brand">
                  <span className="direction-letter" aria-hidden>{dir.id}</span>
                  <div className="direction-card-titles">
                    <span className="direction-id">Direction {dir.id}</span>
                    <h2 className="direction-label">{dir.label}</h2>
                    <p className="direction-tag">{meta.tagline}</p>
                  </div>
                </div>
                <div
                  className={`direction-select-badge ${isSelected ? 'direction-select-badge--active' : ''}`}
                  aria-hidden
                >
                  {isSelected ? selectionOrder : ''}
                </div>
              </header>

              <div className="direction-card-body">
                <section className="direction-preview-block">
                  <div className="direction-preview-head">
                    <BriefSectionIcon section="theme" />
                    <span className="direction-preview-title">{BRIEF_SECTION_META.theme.title}</span>
                  </div>
                  <p className="direction-concept">{dir.brief.theme.concept}</p>
                  <div className="direction-keywords">
                    {dir.brief.theme.moodboard_keywords.map(kw => (
                      <span key={kw} className="chip chip--theme">{kw}</span>
                    ))}
                  </div>
                </section>

                <section className="direction-preview-block">
                  <div className="direction-preview-head">
                    <BriefSectionIcon section="palette" />
                    <span className="direction-preview-title">{BRIEF_SECTION_META.palette.title}</span>
                  </div>
                  <ColorPalette
                    primary={dir.brief.palette.primary}
                    secondary={dir.brief.palette.secondary}
                    accent={dir.brief.palette.accent}
                    rationale={dir.brief.palette.rationale}
                  />
                </section>

                <section className="direction-preview-block">
                  <div className="direction-preview-head">
                    <BriefSectionIcon section="copy" />
                    <span className="direction-preview-title">{BRIEF_SECTION_META.copy.title}</span>
                  </div>
                  <div className="direction-copy-card">
                    <span className="copy-label">Tagline</span>
                    <p className="direction-tagline">&ldquo;{dir.brief.copy.tagline}&rdquo;</p>
                  </div>
                  <p className="direction-body-angle">{dir.brief.copy.body_angle}</p>
                </section>
              </div>
            </article>
          )
        })}
      </div>

      <div className={`picker-action-bar ${canPickOne || canMerge ? 'picker-action-bar--visible' : ''}`}>
        <div className="picker-action-inner">
          {canPickOne && (
            <div className="picker-action-content">
              <p className="picker-action-hint">
                Use <strong>{selectedDirs[0].label}</strong> as your brief
              </p>
              <button
                type="button"
                className="btn-primary picker-action-btn"
                onClick={() => onSelectOne(selectedDirs[0])}
              >
                Use this direction →
              </button>
            </div>
          )}
          {canMerge && (
            <div className="picker-action-content">
              <p className="picker-action-hint">
                Merge <strong>{selectedDirs[0].label}</strong> + <strong>{selectedDirs[1].label}</strong>
              </p>
              <button
                type="button"
                className="btn-primary picker-action-btn picker-merge-btn"
                onClick={() => onMerge(selectedDirs[0], selectedDirs[1])}
                disabled={isMerging}
              >
                {isMerging ? (
                  <>
                    <span className="regen-spinner" />
                    Merging directions…
                  </>
                ) : (
                  'Merge these two →'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
