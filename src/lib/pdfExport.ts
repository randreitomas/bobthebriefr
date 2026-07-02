import type { Brief, SectionKey } from '../types/brief'
import { BRIEF_SECTION_META, BRIEF_SECTION_ICON_SVG } from './briefSections'
import { FOOTER_CREDIT_HTML } from '../components/AppFooter'
import { escapeHtml } from './escapeHtml'
import { toSentenceCase, toSentenceCaseList } from './textCase'

export type PdfExportResult = 'success' | 'blocked' | 'error'

const PRINT_DELAY_MS = 400
const SECTION_ORDER: SectionKey[] = [
  'theme',
  'palette',
  'copy',
  'sponsor_deck',
  'logistics_notes',
]

const TIER_STYLES = [
  { rank: 'Bronze', bg: '#fdf7f2', border: '#e8c9a8' },
  { rank: 'Silver', bg: '#f8f8f8', border: '#d1d1d6' },
  { rank: 'Gold', bg: '#fdfbf0', border: '#e8d48a' },
]

function sectionShell(section: SectionKey, body: string): string {
  const meta = BRIEF_SECTION_META[section]
  return `
    <section class="brief-section">
      <header class="section-header">
        <div class="section-icon-box" style="background:${meta.iconBg};color:${meta.iconColor}">
          ${BRIEF_SECTION_ICON_SVG[section]}
        </div>
        <h2 class="section-title">${escapeHtml(meta.title)}</h2>
      </header>
      <div class="section-body">${body}</div>
    </section>`
}

function buildThemeSection(brief: Brief): string {
  const { theme } = brief
  const chips = theme.moodboard_keywords
    .map(kw => `<span class="chip chip--theme">${escapeHtml(kw)}</span>`)
    .join('')

  return sectionShell(
    'theme',
    `
      <p class="brief-lead">${escapeHtml(theme.concept)}</p>
      <div class="moodboard-chips">${chips}</div>`
  )
}

function buildPaletteSection(brief: Brief): string {
  const { palette } = brief
  const swatches = [
    { label: 'Primary', hex: palette.primary },
    { label: 'Secondary', hex: palette.secondary },
    { label: 'Accent', hex: palette.accent },
  ]
    .map(
      s => `
        <div class="swatch-item">
          <div class="swatch" style="background:${escapeHtml(s.hex)}"></div>
          <span class="swatch-label">${escapeHtml(s.label)}</span>
          <span class="swatch-hex">${escapeHtml(s.hex)}</span>
        </div>`
    )
    .join('')

  return sectionShell(
    'palette',
    `
      <div class="palette-wrapper">
        <div class="swatches">${swatches}</div>
        <p class="palette-rationale">${escapeHtml(palette.rationale)}</p>
      </div>`
  )
}

function buildCopySection(brief: Brief): string {
  const { copy } = brief
  return sectionShell(
    'copy',
    `
      <div class="copy-block">
        <div class="copy-card copy-card--highlight">
          <span class="copy-label">Tagline</span>
          <p class="copy-tagline">&ldquo;${escapeHtml(copy.tagline)}&rdquo;</p>
        </div>
        <div class="copy-card">
          <span class="copy-label">Headline</span>
          <p class="copy-value">${escapeHtml(copy.headline)}</p>
        </div>
        <div class="copy-card">
          <span class="copy-label">Body angle</span>
          <p class="copy-value">${escapeHtml(copy.body_angle)}</p>
        </div>
      </div>`
  )
}

function buildSponsorSection(brief: Brief): string {
  const { sponsor_deck: sd } = brief
  const tiers = sd.tier_names
    .map((name, i) => {
      const style = TIER_STYLES[i]
      return `
        <div class="tier-badge" style="background:${style.bg};border-color:${style.border}">
          <span class="tier-rank">${style.rank}</span>
          <span class="tier-name">${escapeHtml(name)}</span>
        </div>`
    })
    .join('')

  return sectionShell(
    'sponsor_deck',
    `
      <div class="sponsor-block">
        <p class="brief-lead">${escapeHtml(sd.value_proposition)}</p>
        <p class="brief-support">${escapeHtml(sd.audience_snapshot)}</p>
        <div class="tier-row">${tiers}</div>
      </div>`
  )
}

function buildLogisticsSection(brief: Brief): string {
  const { logistics_notes: ln } = brief
  const venueType = toSentenceCase(ln.suggested_venue_type)
  const productionElements = toSentenceCaseList(ln.key_production_elements)
  const watchOut = toSentenceCase(ln.watch_out)
  const production = productionElements
    .map(el => `<li>${escapeHtml(el)}</li>`)
    .join('')

  return sectionShell(
    'logistics_notes',
    `
      <div class="logistics-block">
        <div class="logistics-card">
          <span class="logistics-label">Venue type</span>
          <p class="logistics-value">${escapeHtml(venueType)}</p>
        </div>
        <div class="logistics-card">
          <span class="logistics-label">Key production</span>
          <ul class="logistics-list">${production}</ul>
        </div>
        <div class="logistics-card logistics-card--warn">
          <span class="logistics-label">Watch out</span>
          <p class="logistics-value">${escapeHtml(watchOut)}</p>
        </div>
      </div>`
  )
}

const PRINT_STYLES = `
  @page { margin: 14mm 12mm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    color: #1d1d1f;
    background: #f5f5f7;
    -webkit-font-smoothing: antialiased;
  }
  .page { max-width: 920px; margin: 0 auto; padding: 0 0 32px; }
  .topbar {
    display: flex;
    align-items: center;
    height: 52px;
    padding: 0 4px;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }
  .topbar-brand {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.4px;
    color: #1d1d1f;
  }
  .brief-page { display: flex; flex-direction: column; gap: 20px; }
  .brief-toolbar {
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }
  .form-eyebrow {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #0071e3;
    margin-bottom: 6px;
  }
  .brief-page-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.7px;
    line-height: 1.15;
    color: #1d1d1f;
    margin-bottom: 6px;
  }
  .brief-meta {
    font-size: 13px;
    color: #6e6e73;
  }
  .brief-display { display: flex; flex-direction: column; gap: 14px; }
  .brief-section {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .section-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }
  .section-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .section-title {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -0.25px;
    color: #1d1d1f;
  }
  .section-body { padding: 20px 18px; }
  .brief-lead {
    font-size: 16px;
    line-height: 1.7;
    color: #1d1d1f;
    font-weight: 500;
    margin-bottom: 14px;
  }
  .brief-support {
    font-size: 14px;
    line-height: 1.65;
    color: #6e6e73;
    margin-bottom: 14px;
  }
  .moodboard-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    display: inline-block;
    background: #f5f5f7;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 980px;
    padding: 6px 14px;
    font-size: 13px;
    color: #424245;
    font-weight: 600;
  }
  .chip--theme {
    background: rgba(0,113,227,0.08);
    border-color: rgba(0,113,227,0.15);
    color: #0058b0;
  }
  .palette-wrapper { display: flex; flex-direction: column; gap: 16px; }
  .swatches { display: flex; gap: 18px; flex-wrap: wrap; }
  .swatch-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .swatch {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  }
  .swatch-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6e6e73;
  }
  .swatch-hex {
    font-size: 12px;
    font-family: ui-monospace, "SF Mono", "Fira Mono", monospace;
    color: #1d1d1f;
    font-weight: 600;
  }
  .palette-rationale {
    font-size: 14px;
    color: #6e6e73;
    line-height: 1.65;
    padding: 14px 16px;
    background: #f5f5f7;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.08);
  }
  .copy-block { display: flex; flex-direction: column; gap: 12px; }
  .copy-card {
    padding: 16px 18px;
    background: #f5f5f7;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 12px;
  }
  .copy-card--highlight {
    background: linear-gradient(135deg, #f8fbff 0%, #f0f4ff 100%);
    border-color: rgba(0,113,227,0.15);
  }
  .copy-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #6e6e73;
    margin-bottom: 6px;
  }
  .copy-tagline {
    font-size: 22px;
    font-weight: 800;
    color: #1d1d1f;
    letter-spacing: -0.5px;
    line-height: 1.25;
  }
  .copy-value {
    font-size: 15px;
    color: #424245;
    line-height: 1.65;
  }
  .sponsor-block { display: flex; flex-direction: column; gap: 12px; }
  .tier-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .tier-badge {
    flex: 1;
    min-width: 100px;
    border: 1.5px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .tier-rank {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6e6e73;
  }
  .tier-name {
    font-size: 14px;
    font-weight: 700;
    color: #1d1d1f;
    text-align: center;
    line-height: 1.3;
  }
  .logistics-block { display: flex; flex-direction: column; gap: 12px; }
  .logistics-card {
    padding: 16px 18px;
    background: #f5f5f7;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 12px;
  }
  .logistics-card--warn {
    background: #fffbeb;
    border-color: #fde68a;
  }
  .logistics-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #6e6e73;
    margin-bottom: 8px;
  }
  .logistics-value {
    font-size: 15px;
    line-height: 1.6;
    color: #424245;
  }
  .logistics-card--warn .logistics-value {
    color: #92400e;
    font-weight: 500;
  }
  .logistics-list {
    margin: 0;
    padding-left: 18px;
    font-size: 15px;
    color: #424245;
    line-height: 1.55;
  }
  .logistics-list li { margin-bottom: 6px; }
  .page-footer {
    text-align: center;
    font-size: 12px;
    color: #a1a1a6;
    padding-top: 24px;
    margin-top: 8px;
  }
  .page-footer p { margin: 0 0 6px; }
  .page-footer p:last-child { margin-bottom: 0; }
  .footer-credit a {
    color: #6e6e73;
    text-decoration: none;
  }
  .footer-credit a:hover { color: #1d1d1f; text-decoration: underline; }
  @media print {
    body { background: #f5f5f7; }
    .brief-section { box-shadow: none; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`

function buildPdfHtml(brief: Brief, eventName: string): string {
  const safeEventName = escapeHtml(eventName)
  const dateStr = escapeHtml(
    new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  )

  const sectionBuilders: Record<SectionKey, (b: Brief) => string> = {
    theme: buildThemeSection,
    palette: buildPaletteSection,
    copy: buildCopySection,
    sponsor_deck: buildSponsorSection,
    logistics_notes: buildLogisticsSection,
  }

  const sections = SECTION_ORDER.map(key => sectionBuilders[key](brief)).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Creative Brief — ${safeEventName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  <div class="page">
    <header class="topbar">
      <span class="topbar-brand">BobTheBriefr</span>
    </header>

    <main class="brief-page">
      <header class="brief-toolbar">
        <p class="form-eyebrow">Creative brief</p>
        <h1 class="brief-page-title">${safeEventName}</h1>
        <p class="brief-meta">Generated ${dateStr}</p>
      </header>

      <div class="brief-display">
        ${sections}
      </div>

      <footer class="page-footer">
        ${FOOTER_CREDIT_HTML}
      </footer>
    </main>
  </div>
</body>
</html>`
}

function schedulePrint(win: Window, onDone: () => void): void {
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    onDone()
  }

  const runPrint = () => {
    const trigger = () => {
      try {
        win.focus()
        win.print()
      } catch {
        finish()
        return
      }

      if ('onafterprint' in win) {
        win.addEventListener('afterprint', finish, { once: true })
        setTimeout(finish, 60_000)
      } else {
        setTimeout(finish, 2000)
      }
    }

    if (win.document.fonts?.ready) {
      void win.document.fonts.ready.then(() => setTimeout(trigger, 120)).catch(() => setTimeout(trigger, 120))
    } else {
      setTimeout(trigger, 120)
    }
  }

  if (win.document.readyState === 'complete') {
    setTimeout(runPrint, PRINT_DELAY_MS)
  } else {
    win.addEventListener('load', () => setTimeout(runPrint, PRINT_DELAY_MS), { once: true })
  }
}

function printViaIframe(html: string): PdfExportResult {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'Brief PDF export')
  iframe.setAttribute('aria-hidden', 'true')
  Object.assign(iframe.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '210mm',
    height: '297mm',
    border: 'none',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-1',
  })

  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  const doc = win?.document
  if (!win || !doc) {
    iframe.remove()
    return 'error'
  }

  doc.open()
  doc.write(html)
  doc.close()

  schedulePrint(win, () => {
    iframe.remove()
  })

  return 'success'
}

function printViaBlobPopup(html: string): PdfExportResult {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank', 'noopener,noreferrer')

  if (!win) {
    URL.revokeObjectURL(url)
    return 'blocked'
  }

  schedulePrint(win, () => {
    URL.revokeObjectURL(url)
  })

  return 'success'
}

export function exportAsPDF(brief: Brief, eventName: string): PdfExportResult {
  const html = buildPdfHtml(brief, eventName)

  try {
    const iframeResult = printViaIframe(html)
    if (iframeResult === 'success') return 'success'
  } catch {
    // Fall through to popup-based export.
  }

  try {
    return printViaBlobPopup(html)
  } catch {
    return 'error'
  }
}
