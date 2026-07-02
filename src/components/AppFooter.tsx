const GITHUB_URL = 'https://github.com/randreitomas'
const LINKEDIN_URL = 'https://www.linkedin.com/in/randreitomas'

interface AppFooterProps {
  className?: string
}

export function AppFooter({ className = 'page-footer' }: AppFooterProps) {
  return (
    <footer className={className}>
      <p>
        Built with <strong>IBM Bob</strong> · IBM Granite on watsonx · IBM AI Builders Challenge 2026
      </p>
      <p className="footer-credit">
        Developed by Ralph Andrei Masangkay ·{' '}
        <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>{' '}
        ·{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </p>
    </footer>
  )
}

export const FOOTER_CREDIT_HTML = `
        <p>Built with <strong>IBM Bob</strong> · IBM Granite on watsonx · IBM AI Builders Challenge 2026</p>
        <p class="footer-credit">
          Developed by Ralph Andrei Masangkay ·
          <a href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          ·
          <a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">GitHub</a>
        </p>`
