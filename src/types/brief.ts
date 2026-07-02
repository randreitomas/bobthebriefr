export interface EventFormData {
  eventName: string
  eventType: string
  audience: string
  budget: 'low' | 'mid' | 'high'
  vibe: string
  notes: string
}

export interface ToneControls {
  formality: number   // 0 = casual, 100 = formal
  energy: number      // 0 = calm, 100 = high-energy
  industry: number    // 0 = consumer/lifestyle, 100 = corporate/B2B
}

export const DEFAULT_TONE: ToneControls = { formality: 50, energy: 50, industry: 50 }

export interface Brief {
  theme: {
    concept: string
    moodboard_keywords: string[]
  }
  palette: {
    primary: string
    secondary: string
    accent: string
    rationale: string
  }
  copy: {
    tagline: string
    headline: string
    body_angle: string
  }
  sponsor_deck: {
    value_proposition: string
    audience_snapshot: string
    tier_names: [string, string, string]
  }
  logistics_notes: {
    suggested_venue_type: string
    key_production_elements: string[]
    watch_out: string
  }
}

export type SectionKey = keyof Brief

export interface BriefDirection {
  id: 'A' | 'B' | 'C'
  label: string          // e.g. "Dark & Cinematic"
  brief: Brief
}
