import type { ToneControls } from '../types/brief'

interface Props {
  tone: ToneControls
  onChange: (tone: ToneControls) => void
}

const SLIDERS: {
  key: keyof ToneControls
  label: string
  left: string
  right: string
}[] = [
  { key: 'formality', label: 'Formality', left: 'Casual', right: 'Formal' },
  { key: 'energy', label: 'Energy', left: 'Calm', right: 'High-energy' },
  { key: 'industry', label: 'Industry', left: 'Lifestyle', right: 'Corporate' },
]

function toneLabel(value: number, left: string, right: string): string {
  if (value < 33) return left
  if (value > 66) return right
  return 'Balanced'
}

export function ToneControlsPanel({ tone, onChange }: Props) {
  function set(key: keyof ToneControls, value: number) {
    onChange({ ...tone, [key]: value })
  }

  return (
    <div className="tone-panel app-card">
      <div className="tone-panel-header">
        <div className="tone-panel-icon" aria-hidden>◎</div>
        <div>
          <span className="tone-panel-title">Tone &amp; style</span>
          <span className="tone-panel-hint">Fine-tune how the brief is written</span>
        </div>
      </div>
      <div className="tone-sliders">
        {SLIDERS.map(({ key, label, left, right }) => (
          <div key={key} className="tone-row">
            <div className="tone-row-head">
              <span className="tone-label">{label}</span>
              <span className="tone-value">{toneLabel(tone[key], left, right)}</span>
            </div>
            <div className="tone-slider-group">
              <span className="tone-endpoint">{left}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={tone[key]}
                onChange={e => set(key, Number(e.target.value))}
                className="tone-slider"
                style={{ '--tone-pct': `${tone[key]}%` } as React.CSSProperties}
                aria-label={label}
              />
              <span className="tone-endpoint tone-endpoint--right">{right}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
