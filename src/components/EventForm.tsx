import { useState } from 'react'
import type { EventFormData } from '../types/brief'

interface Props {
  onSubmit: (data: EventFormData) => void
  onGenerateDirections: (data: EventFormData) => void
  isLoading: boolean
  onFieldChange?: () => void
}

const EVENT_TYPES = [
  'Corporate Gala',
  'Product Launch',
  'Music Concert',
  'Art Exhibition',
  'Hackathon',
  'Conference',
  'Wedding',
  'Charity Fundraiser',
  'Festival',
  'Sports Event',
  'Other',
]

const VIBE_OPTIONS = [
  'Bold & Energetic',
  'Elegant & Refined',
  'Playful & Fun',
  'Minimal & Clean',
  'Warm & Intimate',
  'Edgy & Avant-garde',
  'Professional & Corporate',
  'Whimsical & Creative',
]

const BUDGET_LABELS: Record<string, string> = {
  low: 'Low (under $5k)',
  mid: 'Mid ($5k – $50k)',
  high: 'High ($50k+)',
}

const DEMO_PRESETS = [
  { id: 'launch', label: 'Hospital app rollout' },
  { id: 'fundraiser', label: 'Community fundraiser' },
  { id: 'showcase', label: 'Senior design showcase' },
] as const

type DemoPresetId = (typeof DEMO_PRESETS)[number]['id']

const EMPTY: EventFormData = {
  eventName: '',
  eventType: '',
  audience: '',
  budget: 'mid',
  vibe: '',
  notes: '',
}

export function EventForm({ onSubmit, onGenerateDirections, isLoading, onFieldChange }: Props) {
  const [form, setForm] = useState<EventFormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({})
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  function set<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
    setActiveDemo(null)
    onFieldChange?.()
  }

  function validate(): boolean {
    const next: Partial<Record<keyof EventFormData, string>> = {}
    if (!form.eventName.trim()) next.eventName = 'Event name is required.'
    if (!form.eventType) next.eventType = 'Event type is required.'
    if (!form.audience.trim()) next.audience = 'Target audience is required.'
    if (!form.vibe) next.vibe = 'Vibe / tone is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  function handleMultiDirection(e: React.MouseEvent) {
    e.preventDefault()
    if (validate()) onGenerateDirections(form)
  }

  function fillDemo(preset: DemoPresetId) {
    const presets: Record<DemoPresetId, EventFormData> = {
      launch: {
        eventName: 'Meridian Health — Patient Portal Rollout',
        eventType: 'Product Launch',
        audience: 'Clinic managers, front-desk staff, and IT liaisons (~75 people)',
        budget: 'mid',
        vibe: 'Professional & Corporate',
        notes:
          'Morning session at the downtown Marriott conference room. Three breakout rotations for hands-on training. Box lunch provided. Leadership remarks at 9:00 AM; hard stop at 2:00 PM so staff can return to shifts.',
      },
      fundraiser: {
        eventName: 'Westside Food Bank Harvest Dinner',
        eventType: 'Charity Fundraiser',
        audience: 'Returning donors, parish volunteers, and local small-business sponsors',
        budget: 'low',
        vibe: 'Warm & Intimate',
        notes:
          "St. Mark's parish hall, 110 seats max. Silent auction along the side walls. Buffet dinner (chicken or vegetarian). Board president emceeing; one wireless mic and a projector for a 10-minute impact video.",
      },
      showcase: {
        eventName: 'State U Design Society — Senior Showcase',
        eventType: 'Art Exhibition',
        audience: 'Graduating seniors, faculty reviewers, and invited local hiring managers',
        budget: 'low',
        vibe: 'Minimal & Clean',
        notes:
          'Third-floor gallery in the Fine Arts building. Forty capstone projects on display, not for sale. Coffee and cookies only. Friday 4–8 PM; each student staffs their own booth.',
      },
    }
    setForm(presets[preset])
    setErrors({})
    setActiveDemo(preset)
    onFieldChange?.()
  }

  return (
    <div className="form-wrapper app-card">
      <div className="form-header">
        <div className="form-header-top">
          <div>
            <p className="form-eyebrow">New brief</p>
            <h1 className="form-title">Describe your event</h1>
            <p className="form-lead">Six fields in — full creative brief out.</p>
          </div>
        </div>

        <div className="demo-row">
          <span className="demo-label">Examples</span>
          <div className="demo-chips">
            {DEMO_PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                className={`demo-chip ${activeDemo === p.id ? 'demo-chip--active' : ''}`}
                onClick={() => fillDemo(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-section">
          <h2 className="form-section-title">Event details</h2>
          <div className="field-grid">
            <div className={`field field--span-2 ${errors.eventName ? 'field--error' : ''}`}>
              <label htmlFor="eventName">Event name *</label>
              <input
                id="eventName"
                type="text"
                placeholder="e.g. Meridian Health — Patient Portal Rollout"
                value={form.eventName}
                onChange={e => set('eventName', e.target.value)}
              />
              {errors.eventName && <span className="field-error">{errors.eventName}</span>}
            </div>

            <div className={`field ${errors.eventType ? 'field--error' : ''}`}>
              <label htmlFor="eventType">Event type *</label>
              <select
                id="eventType"
                value={form.eventType}
                onChange={e => set('eventType', e.target.value)}
              >
                <option value="">Select type…</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.eventType && <span className="field-error">{errors.eventType}</span>}
            </div>

            <div className="field">
              <label htmlFor="budget">Budget tier</label>
              <select
                id="budget"
                value={form.budget}
                onChange={e => set('budget', e.target.value as EventFormData['budget'])}
              >
                {Object.entries(BUDGET_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className={`field field--span-2 ${errors.audience ? 'field--error' : ''}`}>
              <label htmlFor="audience">Target audience *</label>
              <input
                id="audience"
                type="text"
                placeholder="e.g. Clinic managers and front-desk staff (~75 people)"
                value={form.audience}
                onChange={e => set('audience', e.target.value)}
              />
              {errors.audience && <span className="field-error">{errors.audience}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Creative direction</h2>
          <div className="field-grid">
            <div className={`field field--span-2 ${errors.vibe ? 'field--error' : ''}`}>
              <label htmlFor="vibe">Vibe / tone *</label>
              <select
                id="vibe"
                value={form.vibe}
                onChange={e => set('vibe', e.target.value)}
              >
                <option value="">Select vibe…</option>
                {VIBE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              {errors.vibe && <span className="field-error">{errors.vibe}</span>}
            </div>

            <div className="field field--span-2 field--full">
              <label htmlFor="notes">Additional notes</label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Venue, special requirements, key guests, constraints…"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-submit-row">
          <button type="submit" className="btn-primary btn-primary--lg" disabled={isLoading}>
            {isLoading ? (
              <><span className="btn-spinner" aria-hidden /> Generating…</>
            ) : (
              'Generate Brief →'
            )}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={isLoading}
            onClick={handleMultiDirection}
          >
            {isLoading ? '…' : '⌘ Compare 3 Directions'}
          </button>
        </div>
      </form>
    </div>
  )
}
