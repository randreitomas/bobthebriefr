import { useEffect, useState } from 'react'
import {
  loadUserKeys,
  saveUserKeys,
  WATSONX_REGION_OPTIONS,
  type UserApiKeys,
} from '../lib/userKeys'

interface Props {
  onChange?: () => void
}

export function ApiKeySettings({ onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [keys, setKeys] = useState<UserApiKeys>(() => loadUserKeys())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      saveUserKeys(keys)
      onChange?.()
    }, 400)
    return () => clearTimeout(timer)
  }, [keys, onChange])

  function update<K extends keyof UserApiKeys>(field: K, value: UserApiKeys[K]) {
    setKeys(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSaveNow() {
    saveUserKeys(keys)
    setSaved(true)
    onChange?.()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="api-keys-panel app-card">
      <button
        type="button"
        className="api-keys-toggle"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        <span>watsonx API</span>
        <span className="api-keys-toggle-hint">
          {keys.useOwnKeys ? 'Using your watsonx keys' : 'Using host keys (default)'}
        </span>
      </button>

      {open && (
        <div className="api-keys-body">
          <p className="api-keys-desc">
            By default, this app uses the host&apos;s watsonx credentials from <code>.env</code>.
            Enable &quot;Use my own keys&quot; to run on your IBM Cloud watsonx.ai Lite instance.
            Keys are saved in your browser only.
          </p>

          <label className="api-keys-switch">
            <input
              type="checkbox"
              checked={keys.useOwnKeys}
              onChange={e => update('useOwnKeys', e.target.checked)}
            />
            Use my own watsonx credentials
          </label>

          <div className="api-keys-fields">
            <label className="field">
              <span className="field-label">IBM Cloud API key</span>
              <input
                type="password"
                className="field-input"
                placeholder="Your IBM Cloud API key"
                value={keys.apiKey}
                onChange={e => update('apiKey', e.target.value)}
                autoComplete="off"
              />
              <span className="field-hint">
                Create at{' '}
                <a href="https://cloud.ibm.com/iam/apikeys" target="_blank" rel="noreferrer">
                  IBM Cloud → API keys
                </a>
              </span>
            </label>

            <label className="field">
              <span className="field-label">watsonx project ID</span>
              <input
                type="text"
                className="field-input"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={keys.projectId}
                onChange={e => update('projectId', e.target.value)}
                autoComplete="off"
              />
              <span className="field-hint">
                From your{' '}
                <a href="https://dataplatform.cloud.ibm.com/" target="_blank" rel="noreferrer">
                  watsonx.ai project
                </a>
                {' '}(Project settings → General)
              </span>
            </label>

            <label className="field">
              <span className="field-label">Region endpoint</span>
              <select
                className="field-input"
                value={keys.baseUrl}
                onChange={e => update('baseUrl', e.target.value)}
              >
                {WATSONX_REGION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                Use Tokyo or Sydney from the Philippines for lower latency.
              </span>
            </label>
          </div>

          <div className="api-keys-actions">
            <button type="button" className="btn-primary" onClick={handleSaveNow}>
              {saved ? '✓ Saved' : 'Save now'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
