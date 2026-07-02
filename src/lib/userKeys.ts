export interface UserApiKeys {
  useOwnKeys: boolean
  apiKey: string
  projectId: string
  baseUrl: string
}

const STORAGE_KEY = 'bobthebriefr_api_keys'

const DEFAULT_BASE_URL = 'https://jp-tok.ml.cloud.ibm.com'

const DEFAULT: UserApiKeys = {
  useOwnKeys: false,
  apiKey: '',
  projectId: '',
  baseUrl: DEFAULT_BASE_URL,
}

function migrateStoredKeys(parsed: Record<string, unknown>): UserApiKeys {
  const useOwnKeys = Boolean(parsed.useOwnKeys)

  // New watsonx shape
  if (typeof parsed.apiKey === 'string' || typeof parsed.projectId === 'string') {
    return {
      useOwnKeys,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      projectId: typeof parsed.projectId === 'string' ? parsed.projectId : '',
      baseUrl:
        typeof parsed.baseUrl === 'string' && parsed.baseUrl.trim()
          ? parsed.baseUrl
          : DEFAULT_BASE_URL,
    }
  }

  // Legacy Gemini/Groq keys — require re-entry under watsonx BYOK
  return { ...DEFAULT, useOwnKeys }
}

export function loadUserKeys(): UserApiKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return migrateStoredKeys(parsed)
  } catch {
    return { ...DEFAULT }
  }
}

export function saveUserKeys(keys: UserApiKeys): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export function clearUserKeys(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Headers sent to /api/brief when the user brings their own watsonx credentials. */
export function getBriefAuthHeaders(): Record<string, string> {
  const keys = loadUserKeys()
  if (!keys.useOwnKeys) return {}

  const headers: Record<string, string> = { 'X-Bob-BYOK': 'true' }
  if (keys.apiKey.trim()) headers['X-User-Watsonx-Api-Key'] = keys.apiKey.trim()
  if (keys.projectId.trim()) headers['X-User-Watsonx-Project-Id'] = keys.projectId.trim()
  if (keys.baseUrl.trim()) headers['X-User-Watsonx-Url'] = keys.baseUrl.trim()
  return headers
}

export function hasValidUserKeys(keys: UserApiKeys): boolean {
  if (!keys.useOwnKeys) return true
  return Boolean(keys.apiKey.trim() && keys.projectId.trim())
}

export const WATSONX_REGION_OPTIONS = [
  { label: 'Tokyo (recommended for Asia-Pacific)', value: 'https://jp-tok.ml.cloud.ibm.com' },
  { label: 'Sydney', value: 'https://au-syd.ml.cloud.ibm.com' },
  { label: 'Dallas (US South)', value: 'https://us-south.ml.cloud.ibm.com' },
  { label: 'Frankfurt', value: 'https://eu-de.ml.cloud.ibm.com' },
  { label: 'London', value: 'https://eu-gb.ml.cloud.ibm.com' },
] as const
