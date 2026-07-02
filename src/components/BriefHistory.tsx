import type { BriefRecord } from '../lib/history'
import { formatSavedAt, deleteFromHistory } from '../lib/history'
import type { Brief, EventFormData } from '../types/brief'

interface Props {
  records: BriefRecord[]
  onRestore: (formData: EventFormData, brief: Brief) => void
  onHistoryChange: () => void
}

export function BriefHistory({ records, onRestore, onHistoryChange }: Props) {
  if (records.length === 0) return null

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    deleteFromHistory(id)
    onHistoryChange()
  }

  return (
    <div className="history-panel app-card">
      <div className="history-header">
        <div>
          <span className="history-title">Recent briefs</span>
          <span className="history-sub">Tap to restore</span>
        </div>
        <span className="history-count">{records.length}</span>
      </div>
      <ul className="history-list">
        {records.map(record => (
          <li key={record.id} className="history-item">
            <button
              type="button"
              className="history-restore-btn"
              onClick={() => onRestore(record.formData, record.brief)}
              title="Restore this brief"
            >
              <span className="history-event-name">{record.eventName}</span>
              <span className="history-meta">
                {record.formData.eventType} · {formatSavedAt(record.savedAt)}
              </span>
            </button>
            <button
              type="button"
              className="history-delete-btn"
              onClick={e => handleDelete(record.id, e)}
              title="Delete"
              aria-label="Delete brief"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
