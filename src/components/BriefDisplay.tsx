import type { Brief, SectionKey } from '../types/brief'
import { toSentenceCase, toSentenceCaseList } from '../lib/textCase'
import { BriefSection } from './BriefSection'
import { ColorPalette } from './ColorPalette'

interface Props {
  brief: Brief
  onRegenSection: (section: SectionKey) => void
  regenLoading: Partial<Record<SectionKey, boolean>>
}

export function BriefDisplay({ brief, onRegenSection, regenLoading }: Props) {
  const logistics = brief.logistics_notes
  const venueType = toSentenceCase(logistics.suggested_venue_type)
  const productionElements = toSentenceCaseList(logistics.key_production_elements)
  const watchOut = toSentenceCase(logistics.watch_out)

  return (
    <div className="brief-display">
      <BriefSection
        section="theme"
        onRegenerate={() => onRegenSection('theme')}
        isRegenerating={!!regenLoading.theme}
      >
        <p className="brief-lead">{brief.theme.concept}</p>
        <div className="moodboard-chips">
          {brief.theme.moodboard_keywords.map(kw => (
            <span key={kw} className="chip chip--theme">{kw}</span>
          ))}
        </div>
      </BriefSection>

      <BriefSection
        section="palette"
        onRegenerate={() => onRegenSection('palette')}
        isRegenerating={!!regenLoading.palette}
      >
        <ColorPalette
          primary={brief.palette.primary}
          secondary={brief.palette.secondary}
          accent={brief.palette.accent}
          rationale={brief.palette.rationale}
        />
      </BriefSection>

      <BriefSection
        section="copy"
        onRegenerate={() => onRegenSection('copy')}
        isRegenerating={!!regenLoading.copy}
      >
        <div className="copy-block">
          <div className="copy-card copy-card--highlight">
            <span className="copy-label">Tagline</span>
            <p className="copy-tagline">&ldquo;{brief.copy.tagline}&rdquo;</p>
          </div>
          <div className="copy-card">
            <span className="copy-label">Headline</span>
            <p className="copy-value">{brief.copy.headline}</p>
          </div>
          <div className="copy-card">
            <span className="copy-label">Body angle</span>
            <p className="copy-value">{brief.copy.body_angle}</p>
          </div>
        </div>
      </BriefSection>

      <BriefSection
        section="sponsor_deck"
        onRegenerate={() => onRegenSection('sponsor_deck')}
        isRegenerating={!!regenLoading.sponsor_deck}
      >
        <div className="sponsor-block">
          <p className="brief-lead">{brief.sponsor_deck.value_proposition}</p>
          <p className="brief-support">{brief.sponsor_deck.audience_snapshot}</p>
          <div className="tier-row">
            {brief.sponsor_deck.tier_names.map((name, i) => (
              <div key={i} className={`tier-badge tier-badge--${i}`}>
                <span className="tier-rank">{['Bronze', 'Silver', 'Gold'][i]}</span>
                <span className="tier-name">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </BriefSection>

      <BriefSection
        section="logistics_notes"
        onRegenerate={() => onRegenSection('logistics_notes')}
        isRegenerating={!!regenLoading.logistics_notes}
      >
        <div className="logistics-block">
          <div className="logistics-card">
            <span className="logistics-label">Venue type</span>
            <p className="logistics-value">{venueType}</p>
          </div>
          <div className="logistics-card">
            <span className="logistics-label">Key production</span>
            <ul className="logistics-list">
              {productionElements.map(el => (
                <li key={el}>{el}</li>
              ))}
            </ul>
          </div>
          <div className="logistics-card logistics-card--warn">
            <span className="logistics-label">Watch out</span>
            <p className="logistics-value">{watchOut}</p>
          </div>
        </div>
      </BriefSection>
    </div>
  )
}
