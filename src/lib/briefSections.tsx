import type { ReactNode } from 'react'
import type { SectionKey } from '../types/brief'

export interface BriefSectionMeta {
  title: string
  iconBg: string
  iconColor: string
  icon: ReactNode
}

export const BRIEF_SECTION_META: Record<SectionKey, BriefSectionMeta> = {
  theme: {
    title: 'Theme & Moodboard',
    iconBg: '#eef4ff',
    iconColor: '#0071e3',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 2a6 6 0 0 0-6 6c0 3.3 2.7 6 6 6s6-2.7 6-6a6 6 0 0 0-6-6Z" />
        <path d="M12 14v8M8 22h8" strokeLinecap="round" />
      </svg>
    ),
  },
  palette: {
    title: 'Color Palette',
    iconBg: '#fdf2f8',
    iconColor: '#db2777',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" opacity="0.9" />
        <circle cx="16" cy="8" r="3" fill="currentColor" stroke="none" opacity="0.55" />
        <circle cx="12" cy="15" r="3" fill="currentColor" stroke="none" opacity="0.75" />
      </svg>
    ),
  },
  copy: {
    title: 'Copy & Messaging',
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 6h16M4 12h12M4 18h8" strokeLinecap="round" />
        <path d="M17 16l3 2-3 2v-4Z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  sponsor_deck: {
    title: 'Sponsor Deck',
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M3 11h18M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
      </svg>
    ),
  },
  logistics_notes: {
    title: 'Logistics Notes',
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
}

export const BRIEF_SECTION_ICON_SVG: Record<SectionKey, string> = {
  theme: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2a6 6 0 0 0-6 6c0 3.3 2.7 6 6 6s6-2.7 6-6a6 6 0 0 0-6-6Z"/><path d="M12 14v8M8 22h8" stroke-linecap="round"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor" stroke="none" opacity="0.9"/><circle cx="16" cy="8" r="3" fill="currentColor" stroke="none" opacity="0.55"/><circle cx="12" cy="15" r="3" fill="currentColor" stroke="none" opacity="0.75"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h12M4 18h8" stroke-linecap="round"/><path d="M17 16l3 2-3 2v-4Z" fill="currentColor" stroke="none"/></svg>`,
  sponsor_deck: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 11h18M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-linecap="round"/></svg>`,
  logistics_notes: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4" stroke-linecap="round"/></svg>`,
}

export function BriefSectionIcon({ section }: { section: SectionKey }) {
  const meta = BRIEF_SECTION_META[section]
  return (
    <div
      className="section-icon-box"
      style={{ background: meta.iconBg, color: meta.iconColor }}
      aria-hidden
    >
      {meta.icon}
    </div>
  )
}
