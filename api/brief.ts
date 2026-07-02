import {
  extractWatsonxCredentialsFromHeaders,
  routeBriefRequest,
} from '../server/aiRouter.js'

type HeaderMap = Record<string, string | string[] | undefined>

export default async function handler(
  req: { method?: string; body?: unknown; headers?: HeaderMap },
  res: {
    status: (code: number) => {
      json: (data: unknown) => void
      end: (body?: string) => void
    }
    setHeader: (key: string, value: string) => void
  }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const creds = extractWatsonxCredentialsFromHeaders(req.headers ?? {})
    const result = await routeBriefRequest(req.body, creds)

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('X-AI-Provider', result.provider)
    if (result.modelId) res.setHeader('X-AI-Model', result.modelId)
    try {
      return res.status(result.status).json(JSON.parse(result.body))
    } catch {
      return res.status(result.status).end(result.body)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy request failed'
    return res.status(502).json({ error: message })
  }
}
