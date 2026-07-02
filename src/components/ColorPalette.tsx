interface Props {
  primary: string
  secondary: string
  accent: string
  rationale: string
}

export function ColorPalette({ primary, secondary, accent, rationale }: Props) {
  return (
    <div className="palette-wrapper">
      <div className="swatches">
        {[
          { label: 'Primary', hex: primary },
          { label: 'Secondary', hex: secondary },
          { label: 'Accent', hex: accent },
        ].map(({ label, hex }) => (
          <div key={label} className="swatch-item">
            <div
              className="swatch"
              style={{ backgroundColor: hex }}
              title={hex}
            />
            <span className="swatch-label">{label}</span>
            <span className="swatch-hex">{hex}</span>
          </div>
        ))}
      </div>
      <p className="palette-rationale">{rationale}</p>
    </div>
  )
}
