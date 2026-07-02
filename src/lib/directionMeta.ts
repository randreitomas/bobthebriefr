import type { BriefDirection } from '../types/brief'

export interface DirectionMeta {
  accent: string
  iconBg: string
  tagline: string
}

export const DIRECTION_META: Record<BriefDirection['id'], DirectionMeta> = {
  A: {
    accent: '#dc2626',
    iconBg: '#fef2f2',
    tagline: 'Bold contrast and cinematic energy',
  },
  B: {
    accent: '#4f46e5',
    iconBg: '#eef2ff',
    tagline: 'Editorial restraint and quiet luxury',
  },
  C: {
    accent: '#d97706',
    iconBg: '#fffbeb',
    tagline: 'Warm storytelling and human connection',
  },
}
