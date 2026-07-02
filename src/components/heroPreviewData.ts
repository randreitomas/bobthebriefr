import type { SectionKey } from '../types/brief'
import { BRIEF_SECTION_META } from '../lib/briefSections'

// Re-export preview section order for the landing page animation
export const PREVIEW_SECTION_ORDER: SectionKey[] = [
  'theme',
  'palette',
  'copy',
  'sponsor_deck',
  'logistics_notes',
]

export { BRIEF_SECTION_META }
