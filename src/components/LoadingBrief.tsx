interface Props {
  merging?: boolean
  progress?: { completed: number; total: number } | null
  onCancel?: () => void
}

export function LoadingBrief({ merging, progress, onCancel }: Props) {
  const label = merging
    ? 'Merging directions…'
    : progress
      ? `Generating direction ${Math.min(progress.completed + 1, progress.total)} of ${progress.total}…`
      : 'Generating your creative brief…'

  return (
    <div className="loading-wrapper">
      <div className="loading-header">
        <div className="loading-spinner" />
        <p className="loading-label">{label}</p>
        {onCancel && (
          <button type="button" className="btn-ghost loading-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
      <div className="skeleton-grid">
        {['Theme Concept', 'Color Palette', 'Copy & Messaging', 'Sponsor Deck', 'Logistics Notes'].map(title => (
          <div key={title} className="skeleton-card">
            <div className="skeleton-title">{title}</div>
            <div className="skeleton-line" style={{ width: '90%' }} />
            <div className="skeleton-line" style={{ width: '75%' }} />
            <div className="skeleton-line" style={{ width: '82%' }} />
            <div className="skeleton-line" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
