import { useEffect, useState, type ReactNode } from 'react'
import type { SectionKey } from '../types/brief'
import { BRIEF_SECTION_META, BriefSectionIcon } from '../lib/briefSections'
import { PREVIEW_SECTION_ORDER } from './heroPreviewData'

const EVENT_NAME = 'Meridian Health — Patient Portal Rollout'

const PREVIEW_CONTENT: Record<SectionKey, ReactNode> = {
  theme: (
    <>
      <p className="hero-preview-text">
        A clear, confident rollout that helps clinic staff adopt the new portal without slowing down patient check-in.
      </p>
      <div className="hero-preview-chips">
        {['Practical', 'Staff-first', 'Clear', 'Efficient', 'Trustworthy'].map(kw => (
          <span key={kw} className="hero-preview-chip">{kw}</span>
        ))}
      </div>
    </>
  ),
  palette: (
    <>
      <div className="hero-preview-swatches">
        <span className="hero-preview-swatch" style={{ background: '#0F62FE' }} title="#0F62FE" />
        <span className="hero-preview-swatch" style={{ background: '#001D6C' }} title="#001D6C" />
        <span className="hero-preview-swatch" style={{ background: '#78A9FF' }} title="#78A9FF" />
      </div>
      <p className="hero-preview-text hero-preview-text--muted">
        Clinical blues — credible, calm, and easy to read on screen all day.
      </p>
    </>
  ),
  copy: (
    <>
      <p className="hero-preview-quote">&ldquo;Less clicks. More care.&rdquo;</p>
      <p className="hero-preview-text">
        Headline: Training that fits between morning rounds and the lunch rush.
      </p>
    </>
  ),
  sponsor_deck: (
    <>
      <p className="hero-preview-text">
        Put your brand beside a tool staff will use every shift — visible to administrators and front-desk teams alike.
      </p>
      <div className="hero-preview-tiers">
        <span className="hero-preview-tier">Community</span>
        <span className="hero-preview-tier">Partner</span>
        <span className="hero-preview-tier">Presenting</span>
      </div>
    </>
  ),
  logistics_notes: (
    <>
      <p className="hero-preview-text">
        <strong>Venue:</strong> Downtown Marriott — breakout rooms A &amp; B
      </p>
      <p className="hero-preview-text hero-preview-text--warn">
        <strong>Watch out:</strong> Hard stop at 2:00 PM — most attendees return to active shifts
      </p>
    </>
  ),
}

const PREVIEW_SECTIONS = PREVIEW_SECTION_ORDER.map(id => ({
  id,
  title: BRIEF_SECTION_META[id].title,
  content: PREVIEW_CONTENT[id],
}))

const REVEAL_MS = 1100
const HOLD_MS = 4000

export function HeroBriefPreview() {
  const [revealed, setRevealed] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    setRevealed(0)
    const timers: ReturnType<typeof setTimeout>[] = []

    for (let i = 1; i <= PREVIEW_SECTIONS.length; i++) {
      timers.push(setTimeout(() => setRevealed(i), 500 + i * REVEAL_MS))
    }

    timers.push(
      setTimeout(
        () => setCycle(c => c + 1),
        500 + PREVIEW_SECTIONS.length * REVEAL_MS + HOLD_MS
      )
    )

    return () => timers.forEach(clearTimeout)
  }, [cycle])

  return (
    <div className="hero-preview" key={cycle}>
      <div className="hero-preview-bar">
        <span className="hero-preview-dot" style={{ background: '#ef4444' }} />
        <span className="hero-preview-dot" style={{ background: '#f59e0b' }} />
        <span className="hero-preview-dot" style={{ background: '#22c55e' }} />
        <span className="hero-preview-title">Creative Brief — {EVENT_NAME}</span>
        <span className="hero-preview-status" aria-live="polite">
          {revealed === 0 ? 'Generating…' : revealed < PREVIEW_SECTIONS.length ? 'Writing…' : 'Complete'}
        </span>
      </div>

      <div className="hero-preview-sections">
        {PREVIEW_SECTIONS.map((section, index) => {
          const isRevealed = revealed > index
          const isActive = revealed === index + 1

          return (
            <div
              key={section.id}
              className={`hero-preview-row ${isRevealed ? 'hero-preview-row--filled' : ''} ${isActive ? 'hero-preview-row--active' : ''}`}
            >
              <BriefSectionIcon section={section.id} />
              <div className="hero-preview-body">
                <div className="hero-preview-label">{section.title}</div>
                {isRevealed ? (
                  <div className="hero-preview-content">{section.content}</div>
                ) : (
                  <div className="hero-preview-placeholder" aria-hidden>
                    <span className="hero-preview-shimmer" style={{ width: '88%' }} />
                    <span className="hero-preview-shimmer" style={{ width: '62%' }} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="hero-preview-progress" aria-hidden>
        <div
          className="hero-preview-progress-fill"
          style={{ width: `${(revealed / PREVIEW_SECTIONS.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
