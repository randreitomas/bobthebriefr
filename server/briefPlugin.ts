import { loadEnv, type Plugin } from 'vite'
import type { Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  extractWatsonxCredentialsFromHeaders,
  routeBriefRequest,
  type WatsonxCredentials,
} from './aiRouter.ts'

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

function normalizeHeaders(req: IncomingMessage): Record<string, string | string[] | undefined> {
  return req.headers as Record<string, string | string[] | undefined>
}

export function briefApiPlugin(): Plugin {
  let serverCreds: WatsonxCredentials = {}

  return {
    name: 'bobthebriefr-brief-api',
    config(_config, env) {
      const loaded = loadEnv(env.mode, process.cwd(), '')
      serverCreds = {
        apiKey: loaded.WATSONX_API_KEY,
        projectId: loaded.WATSONX_PROJECT_ID,
        baseUrl: loaded.WATSONX_URL,
        modelId: loaded.WATSONX_MODEL,
      }
    },
    configureServer(server) {
      server.middlewares.use(createHandler(() => serverCreds))
    },
    configurePreviewServer(server) {
      server.middlewares.use(createHandler(() => serverCreds))
    },
  }
}

function createHandler(getServerCreds: () => WatsonxCredentials): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (!req.url?.startsWith('/api/brief')) {
      next()
      return
    }
    void handleBriefRequest(req, res, getServerCreds())
  }
}

async function handleBriefRequest(
  req: IncomingMessage,
  res: ServerResponse,
  serverCreds: WatsonxCredentials
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  try {
    const body = await readJsonBody(req)
    const creds = extractWatsonxCredentialsFromHeaders(normalizeHeaders(req), serverCreds)
    const result = await routeBriefRequest(body, creds)

    res.statusCode = result.status
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('X-AI-Provider', result.provider)
    if (result.modelId) res.setHeader('X-AI-Model', result.modelId)
    res.end(result.body)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy request failed'
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: message }))
  }
}
