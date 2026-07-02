const IAM_URL = 'https://iam.cloud.ibm.com/identity/token'

interface TokenCache {
  token: string
  expiresAt: number
}

const tokenCache = new Map<string, TokenCache>()

/** Exchange an IBM Cloud API key for a short-lived IAM bearer token. */
export async function getIamToken(apiKey: string): Promise<string> {
  const key = apiKey.trim()
  const cached = tokenCache.get(key)
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token
  }

  const res = await fetch(IAM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(key)}`,
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`IBM IAM auth failed (${res.status}): ${text.slice(0, 200)}`)
  }

  let data: { access_token?: string; expires_in?: number }
  try {
    data = JSON.parse(text) as { access_token?: string; expires_in?: number }
  } catch {
    throw new Error('IBM IAM auth returned invalid JSON.')
  }

  if (!data.access_token) {
    throw new Error('IBM IAM auth did not return an access token.')
  }

  const expiresInMs = (data.expires_in ?? 3600) * 1000
  tokenCache.set(key, {
    token: data.access_token,
    expiresAt: Date.now() + expiresInMs,
  })

  return data.access_token
}
