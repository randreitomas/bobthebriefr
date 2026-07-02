import type { Brief, SectionKey } from '../types/brief'
import { toSentenceCase, toSentenceCaseList } from './textCase'

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function isStringArray(v: unknown, min: number): v is string[] {
  return Array.isArray(v) && v.length >= min && v.every(isNonEmptyString)
}

function isHexColor(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v)
}

export function validateBrief(data: unknown): asserts data is Brief {
  if (!data || typeof data !== 'object') {
    throw new Error('AI response is missing the brief structure.')
  }

  const b = data as Record<string, unknown>

  const theme = b.theme
  if (!theme || typeof theme !== 'object') throw new Error('Brief is missing theme.')
  const t = theme as Record<string, unknown>
  if (!isNonEmptyString(t.concept)) throw new Error('Brief theme is incomplete.')
  if (!isStringArray(t.moodboard_keywords, 3)) throw new Error('Brief moodboard keywords are incomplete.')

  const palette = b.palette
  if (!palette || typeof palette !== 'object') throw new Error('Brief is missing palette.')
  const p = palette as Record<string, unknown>
  if (!isHexColor(p.primary) || !isHexColor(p.secondary) || !isHexColor(p.accent)) {
    throw new Error('Brief color palette has invalid hex codes.')
  }
  if (!isNonEmptyString(p.rationale)) throw new Error('Brief palette rationale is missing.')

  const copy = b.copy
  if (!copy || typeof copy !== 'object') throw new Error('Brief is missing copy.')
  const c = copy as Record<string, unknown>
  if (!isNonEmptyString(c.tagline) || !isNonEmptyString(c.headline) || !isNonEmptyString(c.body_angle)) {
    throw new Error('Brief copy section is incomplete.')
  }

  const sponsor = b.sponsor_deck
  if (!sponsor || typeof sponsor !== 'object') throw new Error('Brief is missing sponsor deck.')
  const s = sponsor as Record<string, unknown>
  if (!isNonEmptyString(s.value_proposition) || !isNonEmptyString(s.audience_snapshot)) {
    throw new Error('Brief sponsor deck is incomplete.')
  }
  if (!isStringArray(s.tier_names, 3)) throw new Error('Brief sponsor tiers are incomplete.')

  const logistics = b.logistics_notes
  if (!logistics || typeof logistics !== 'object') throw new Error('Brief is missing logistics.')
  const l = logistics as Record<string, unknown>
  if (!isNonEmptyString(l.suggested_venue_type) || !isNonEmptyString(l.watch_out)) {
    throw new Error('Brief logistics section is incomplete.')
  }
  if (!isStringArray(l.key_production_elements, 2)) {
    throw new Error('Brief production elements are incomplete.')
  }

  normalizeLogisticsFields(l)
}

export function validateSection<K extends SectionKey>(section: K, data: unknown): asserts data is Brief[K] {
  if (!data || typeof data !== 'object') {
    throw new Error(`AI response is missing the ${section} section.`)
  }

  const value = data as Record<string, unknown>

  switch (section) {
    case 'theme':
      if (!isNonEmptyString(value.concept)) throw new Error('Theme concept is incomplete.')
      if (!isStringArray(value.moodboard_keywords, 3)) throw new Error('Theme keywords are incomplete.')
      break
    case 'palette':
      if (!isHexColor(value.primary) || !isHexColor(value.secondary) || !isHexColor(value.accent)) {
        throw new Error('Palette hex codes are invalid.')
      }
      if (!isNonEmptyString(value.rationale)) throw new Error('Palette rationale is missing.')
      break
    case 'copy':
      if (!isNonEmptyString(value.tagline) || !isNonEmptyString(value.headline) || !isNonEmptyString(value.body_angle)) {
        throw new Error('Copy section is incomplete.')
      }
      break
    case 'sponsor_deck':
      if (!isNonEmptyString(value.value_proposition) || !isNonEmptyString(value.audience_snapshot)) {
        throw new Error('Sponsor deck is incomplete.')
      }
      if (!isStringArray(value.tier_names, 3)) throw new Error('Sponsor tiers are incomplete.')
      break
    case 'logistics_notes':
      if (!isNonEmptyString(value.suggested_venue_type) || !isNonEmptyString(value.watch_out)) {
        throw new Error('Logistics section is incomplete.')
      }
      if (!isStringArray(value.key_production_elements, 2)) {
        throw new Error('Production elements are incomplete.')
      }
      normalizeLogisticsFields(value)
      break
  }
}

export function parseBriefJSON(raw: string): Brief {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/gm, '').trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned invalid JSON. Please try again.')
  }
  validateBrief(parsed)
  return parsed
}

export function parseSectionJSON<K extends SectionKey>(raw: string, section: K): Brief[K] {
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/gm, '').trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned invalid JSON. Please try again.')
  }
  validateSection(section, parsed)
  return parsed
}

function normalizeLogisticsFields(logistics: Record<string, unknown>): void {
  if (typeof logistics.suggested_venue_type === 'string') {
    logistics.suggested_venue_type = toSentenceCase(logistics.suggested_venue_type)
  }
  if (typeof logistics.watch_out === 'string') {
    logistics.watch_out = toSentenceCase(logistics.watch_out)
  }
  if (Array.isArray(logistics.key_production_elements)) {
    logistics.key_production_elements = toSentenceCaseList(
      logistics.key_production_elements.filter((el): el is string => typeof el === 'string')
    )
  }
}
