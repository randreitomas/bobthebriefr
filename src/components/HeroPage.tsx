import { HeroBriefPreview } from './HeroBriefPreview'
import { AppFooter } from './AppFooter'

interface Props {
  onGetStarted: () => void
}

const HOW_STEPS = [
  { n: '01', title: 'Fill the form', desc: 'Six fields: event name, type, audience, budget, vibe, and notes.' },
  { n: '02', title: 'Creative pass', desc: 'AI generates rich creative prose tailored to your event context and tone controls.' },
  { n: '03', title: 'Schema pass', desc: 'A second pass extracts the output into guaranteed-parseable JSON for every section.' },
  { n: '04', title: 'You iterate', desc: 'Regenerate any single section without touching the rest. Compare three directions or merge two.' },
]

export function HeroPage({ onGetStarted }: Props) {
  return (
    <div className="hero-page">
      <section className="hero-section">
        <h1 className="hero-headline">
          Your event brief,<br />
          <em>written in seconds.</em>
        </h1>
        <p className="hero-sub">
          Describe your event. BobTheBriefr runs a two-pass AI pipeline — creative generation,
          then schema enforcement — to produce a production-ready brief in seconds.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn-primary hero-cta" onClick={onGetStarted}>
            Generate My Brief →
          </button>
        </div>

        <HeroBriefPreview />
      </section>

      <section className="how-section">
        <h2 className="section-heading">How it works</h2>
        <div className="how-steps">
          {HOW_STEPS.map(s => (
            <div key={s.n} className="how-step">
              <span className="how-num">{s.n}</span>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hero-footer-cta">
        <h2 className="hero-footer-heading">Your next event starts here.</h2>
        <p className="hero-footer-sub">No signup required — describe your event and get a full creative brief in seconds.</p>
        <button type="button" className="btn-primary hero-cta" onClick={onGetStarted}>
          Generate My Brief →
        </button>
      </section>

      <AppFooter className="hero-footer" />
    </div>
  )
}
