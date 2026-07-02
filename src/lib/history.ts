import type { Brief, EventFormData } from '../types/brief'

export interface BriefRecord {
  id: string
  savedAt: string // ISO string
  eventName: string
  formData: EventFormData
  brief: Brief
}

const STORAGE_KEY = 'bobthebriefr_history'
const MAX_RECORDS = 20

export function loadHistory(): BriefRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BriefRecord[]) : []
  } catch {
    return []
  }
}

export function saveToHistory(formData: EventFormData, brief: Brief): BriefRecord {
  const record: BriefRecord = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    eventName: formData.eventName,
    formData,
    brief,
  }
  const existing = loadHistory().filter(r => r.id !== record.id)
  const updated = [record, ...existing].slice(0, MAX_RECORDS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return record
}

export function deleteFromHistory(id: string): void {
  const updated = loadHistory().filter(r => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
