import type { Brief, EventFormData, SectionKey, ToneControls } from '../types/brief'

const LOGISTICS_CASE_NOTE =
  'For logistics_notes, use sentence case (capitalize the first letter of each string and list item).'

export const SYSTEM_PROMPT = `You are a creative director assistant specializing in event production.
Generate structured creative briefs for events.
Always respond with valid JSON only. No markdown, no preamble, no explanation outside the JSON object.`

function toneDescription(tone: ToneControls): string {
  const formality = tone.formality < 33 ? 'casual and conversational' : tone.formality > 66 ? 'highly formal and polished' : 'semi-formal'
  const energy = tone.energy < 33 ? 'calm and understated' : tone.energy > 66 ? 'high-energy and dynamic' : 'balanced in energy'
  const industry = tone.industry < 33 ? 'consumer-lifestyle oriented' : tone.industry > 66 ? 'corporate and B2B focused' : 'mixed consumer and professional'
  return `${formality}, ${energy}, ${industry}`
}

export function buildFullPrompt(form: EventFormData, tone?: ToneControls): string {
  const toneNote = tone ? `\nTone style: ${toneDescription(tone)}` : ''
  return `Generate a creative brief for the following event.

Event name: ${form.eventName}
Event type: ${form.eventType}
Target audience: ${form.audience}
Budget tier: ${form.budget}
Vibe / tone: ${form.vibe}
Additional notes: ${form.notes || 'None'}${toneNote}

Return a JSON object with exactly this structure:
{
  "theme": { "concept": "...", "moodboard_keywords": ["", "", "", "", ""] },
  "palette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "rationale": "..." },
  "copy": { "tagline": "...", "headline": "...", "body_angle": "..." },
  "sponsor_deck": { "value_proposition": "...", "audience_snapshot": "...", "tier_names": ["", "", ""] },
  "logistics_notes": { "suggested_venue_type": "...", "key_production_elements": ["", "", ""], "watch_out": "..." }
}

${LOGISTICS_CASE_NOTE}`
}

const SECTION_SCHEMAS: Record<SectionKey, string> = {
  theme: `{ "concept": "...", "moodboard_keywords": ["", "", "", "", ""] }`,
  palette: `{ "primary": "#hex", "secondary": "#hex", "accent": "#hex", "rationale": "..." }`,
  copy: `{ "tagline": "...", "headline": "...", "body_angle": "..." }`,
  sponsor_deck: `{ "value_proposition": "...", "audience_snapshot": "...", "tier_names": ["", "", ""] }`,
  logistics_notes: `{ "suggested_venue_type": "...", "key_production_elements": ["", "", ""], "watch_out": "..." } (sentence case)`,
}

export function buildSectionPrompt(section: SectionKey, form: EventFormData, tone?: ToneControls): string {
  const toneNote = tone ? ` | Tone: ${toneDescription(tone)}` : ''
  return `Regenerate only the "${section}" section for this event brief.
Event: ${form.eventName} | Type: ${form.eventType} | Vibe: ${form.vibe} | Budget: ${form.budget}${toneNote}
Return JSON for only this object: ${SECTION_SCHEMAS[section]}`
}

// ── Multi-direction generation ──────────────────────────────────────────────
// Each direction gets a distinct creative angle so parallel calls diverge meaningfully.

const DIRECTION_HINTS: Record<'A' | 'B' | 'C', { label: string; angle: string }> = {
  A: {
    label: 'Bold & Dramatic',
    angle: 'Take a bold, high-contrast, dramatic direction. Think striking visuals, powerful statements, cinematic scale. Push the energy and spectacle.',
  },
  B: {
    label: 'Refined & Understated',
    angle: 'Take a refined, understated, editorial direction. Think restraint, white space, quiet luxury, and sophisticated minimalism.',
  },
  C: {
    label: 'Warm & Human',
    angle: 'Take a warm, human, community-centered direction. Think authenticity, storytelling, connection, and emotional resonance over spectacle.',
  },
}

export function getDirectionLabel(id: 'A' | 'B' | 'C'): string {
  return DIRECTION_HINTS[id].label
}

export function buildDirectionPrompt(form: EventFormData, tone: ToneControls | undefined, id: 'A' | 'B' | 'C'): string {
  const { angle } = DIRECTION_HINTS[id]
  const toneNote = tone ? `\nTone style: ${toneDescription(tone)}` : ''
  return `Generate a creative brief for the following event.

Event name: ${form.eventName}
Event type: ${form.eventType}
Target audience: ${form.audience}
Budget tier: ${form.budget}
Vibe / tone: ${form.vibe}
Additional notes: ${form.notes || 'None'}${toneNote}

Creative direction: ${angle}

Return a JSON object with exactly this structure:
{
  "theme": { "concept": "...", "moodboard_keywords": ["", "", "", "", ""] },
  "palette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "rationale": "..." },
  "copy": { "tagline": "...", "headline": "...", "body_angle": "..." },
  "sponsor_deck": { "value_proposition": "...", "audience_snapshot": "...", "tier_names": ["", "", ""] },
  "logistics_notes": { "suggested_venue_type": "...", "key_production_elements": ["", "", ""], "watch_out": "..." }
}

${LOGISTICS_CASE_NOTE}`
}

export function buildMergePrompt(labelA: string, briefA: Brief, labelB: string, briefB: Brief): string {
  return `You are a senior creative director. Two creative brief directions have been presented for the same event. Your task is to synthesize the best elements of both into a single, coherent creative brief.

Direction "${labelA}":
${JSON.stringify(briefA, null, 2)}

Direction "${labelB}":
${JSON.stringify(briefB, null, 2)}

Synthesize these two directions into one unified creative brief. Take the strongest, most complementary elements from each — do not simply average them, but make creative judgment calls about what works best together.

Return a JSON object with exactly this structure:
{
  "theme": { "concept": "...", "moodboard_keywords": ["", "", "", "", ""] },
  "palette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "rationale": "..." },
  "copy": { "tagline": "...", "headline": "...", "body_angle": "..." },
  "sponsor_deck": { "value_proposition": "...", "audience_snapshot": "...", "tier_names": ["", "", ""] },
  "logistics_notes": { "suggested_venue_type": "...", "key_production_elements": ["", "", ""], "watch_out": "..." }
}

${LOGISTICS_CASE_NOTE}`
}
