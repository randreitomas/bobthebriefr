import {
  extractWatsonxCredentialsFromHeaders,
  routeBriefRequest,
} from './lib/aiRouter.js'

type HeaderMap = Record<string, string | string[] | undefined>

type VercelRequest = {
  method?: string
  body?: unknown
  headers?: HeaderMap
}

type VercelResponse = {
  status: (code: number) => {
    json: (data: unknown) => void
    end: (body?: string) => void
  }
  setHeader: (key: string, value: string) => void
}

function parseRequestBody(body: unknown): unknown {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      throw new Error('Invalid JSON body.')
    }
  }
  return body
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const creds = extractWatsonxCredentialsFromHeaders(req.headers ?? {})
    const result = await routeBriefRequest(parseRequestBody(req.body), creds)

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
    console.error('[api/brief]', message)
    return res.status(502).json({ error: message })
  }
}
