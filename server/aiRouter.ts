import { getIamToken } from './watsonxAuth.ts'

export const WATSONX_DEFAULT_URL =
  process.env.WATSONX_URL ?? 'https://jp-tok.ml.cloud.ibm.com'

export const WATSONX_CHAT_VERSION = process.env.WATSONX_CHAT_VERSION ?? '2024-10-08'

const DEFAULT_MODEL = 'ibm/granite-4-h-small'

/** Tried in order when the preferred model is unavailable in a region/plan. */
const MODEL_FALLBACK_CHAIN = [
  'ibm/granite-4-h-small',
  'ibm/granite-3-3-8b-instruct',
  'ibm/granite-3-2-8b-instruct',
  'meta-llama/llama-3-3-70b-instruct',
]

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

export interface WatsonxCredentials {
  apiKey?: string
  projectId?: string
  baseUrl?: string
  modelId?: string
}

export interface RouteResult {
  status: number
  body: string
  provider: 'watsonx'
  modelId?: string
}

interface ChatMessage {
  role: string
  content: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function getModelCandidates(preferred?: string): string[] {
  const envFallbacks = process.env.WATSONX_MODEL_FALLBACKS?.split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const chain = [
    preferred,
    process.env.WATSONX_MODEL,
    ...(envFallbacks?.length ? envFallbacks : MODEL_FALLBACK_CHAIN),
  ].filter((id): id is string => Boolean(id?.trim()))

  return [...new Set(chain)]
}

function isModelNotSupported(status: number, text: string): boolean {
  return status === 404 && text.toLowerCase().includes('model_not_supported')
}

function normalizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return []

  return messages
    .map(msg => {
      if (!isRecord(msg) || typeof msg.role !== 'string') return null
      const content = msg.content
      if (typeof content === 'string') {
        return { role: msg.role.toLowerCase(), content }
      }
      if (Array.isArray(content)) {
        const text = content
          .map(part => {
            if (!isRecord(part)) return ''
            if (typeof part.text === 'string') return part.text
            if (typeof part.content === 'string') return part.content
            return ''
          })
          .filter(Boolean)
          .join('\n')
        return { role: msg.role.toLowerCase(), content: text }
      }
      return null
    })
    .filter((msg): msg is ChatMessage => Boolean(msg?.content.trim()))
}

function buildWatsonxBody(
  openAiBody: Record<string, unknown>,
  creds: WatsonxCredentials,
  modelId: string
): Record<string, unknown> {
  const messages = normalizeMessages(openAiBody.messages)
  if (messages.length === 0) {
    throw new Error('Request is missing chat messages.')
  }

  const payload: Record<string, unknown> = {
    model_id: modelId,
    project_id: creds.projectId,
    messages,
    max_tokens: typeof openAiBody.max_tokens === 'number' ? openAiBody.max_tokens : 4096,
  }

  if (typeof openAiBody.temperature === 'number') {
    payload.temperature = openAiBody.temperature
  }

  return payload
}

async function callWatsonxChatOnce(
  creds: WatsonxCredentials,
  openAiBody: Record<string, unknown>,
  modelId: string
): Promise<{ status: number; text: string }> {
  const apiKey = creds.apiKey?.trim()
  const projectId = creds.projectId?.trim()
  const baseUrl = normalizeBaseUrl(creds.baseUrl?.trim() || WATSONX_DEFAULT_URL)

  if (!apiKey || !projectId) {
    throw new Error('watsonx credentials are incomplete (API key and project ID required).')
  }

  const token = await getIamToken(apiKey)
  const watsonxBody = buildWatsonxBody(openAiBody, creds, modelId)
  const url = `${baseUrl}/ml/v1/text/chat?version=${WATSONX_CHAT_VERSION}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(watsonxBody),
  })

  return { status: res.status, text: await res.text() }
}

async function callWatsonxChat(
  creds: WatsonxCredentials,
  openAiBody: unknown
): Promise<{ status: number; text: string; modelId: string }> {
  if (!isRecord(openAiBody)) {
    throw new Error('Invalid request body.')
  }

  const models = getModelCandidates(creds.modelId)
  const skipped: string[] = []
  let lastStatus = 502
  let lastText = ''

  for (const modelId of models) {
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt > 0) await delay(retryDelayMs(attempt - 1, lastStatus))

      const { status, text } = await callWatsonxChatOnce(creds, openAiBody, modelId)

      if (status >= 200 && status < 300) {
        return { status, text, modelId }
      }

      lastStatus = status
      lastText = text

      if (isModelNotSupported(status, text)) {
        skipped.push(modelId)
        break
      }

      if (RETRYABLE_STATUSES.has(status) && attempt < 4) {
        continue
      }

      throw new Error(formatWatsonxError(status, text, skipped))
    }
  }

  throw new Error(formatWatsonxError(lastStatus, lastText, skipped))
}

function formatWatsonxError(status: number, text: string, skippedModels: string[] = []): string {
  const lower = text.toLowerCase()

  if (lower.includes('container_not_found') || lower.includes('failed to find project_id')) {
    return (
      'watsonx: Project ID not found in this region. Your WATSONX_URL must match where the project was created ' +
      '(e.g. us-south project → https://us-south.ml.cloud.ibm.com, Tokyo → https://jp-tok.ml.cloud.ibm.com). ' +
      'Copy the project ID from watsonx.ai while the same region is selected in the console.'
    )
  }

  if (lower.includes('no_associated_service_instance_error')) {
    return (
      'watsonx: Your project is not linked to a watsonx.ai / Watson Machine Learning service instance. ' +
      'In watsonx.ai go to Manage → Services & integrations → Associate service, pick your WML instance ' +
      '(same region as WATSONX_URL), then restart the dev server.'
    )
  }

  if (lower.includes('model_not_supported') || skippedModels.length > 0) {
    const tried = skippedModels.length ? ` Tried: ${skippedModels.join(', ')}.` : ''
    return (
      'watsonx: No supported model found for your region/plan.' +
      tried +
      ' Tokyo (jp-tok) Lite often has no Granite — set WATSONX_MODEL=meta-llama/llama-3-3-70b-instruct in .env, ' +
      'or create a us-south project for ibm/granite-4-h-small.'
    )
  }

  if (lower.includes('consumption_limit_reached') || (status === 429 && lower.includes('concurrent'))) {
    return (
      'watsonx: Lite plan concurrent request limit reached for this model. ' +
      'Wait 30–60 seconds, close other tabs using watsonx, then try again. ' +
      'The app now queues requests one at a time to stay within the free tier limit.'
    )
  }

  if (status === 429) {
    return 'watsonx: Rate limit hit. Please wait a moment and try again.'
  }

  if (lower.includes('not authorized') || status === 401) {
    return 'watsonx: API key rejected. Create a new key at cloud.ibm.com/iam/apikeys and ensure your user is Editor on the watsonx project.'
  }

  if (status === 403) {
    return `watsonx 403: Access denied. Confirm the project ID, region endpoint (WATSONX_URL), and that your account is an Editor on the project. Details: ${text.slice(0, 180)}`
  }

  return `watsonx ${status}: ${text.slice(0, 240)}`
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function retryDelayMs(attempt: number, status?: number): number {
  if (status === 429) return [2000, 5000, 10000, 20000][attempt] ?? 20000
  return 900 * (attempt + 1)
}

export async function routeBriefRequest(
  body: unknown,
  creds: WatsonxCredentials
): Promise<RouteResult> {
  const apiKey = creds.apiKey?.trim()
  const projectId = creds.projectId?.trim()

  if (!apiKey || !projectId) {
    throw new Error(
      'No watsonx credentials available. Set WATSONX_API_KEY and WATSONX_PROJECT_ID in .env, or enable "Use my own keys" in the app settings.'
    )
  }

  try {
    const { status, text, modelId } = await callWatsonxChat(creds, body)
    return { status, body: text, provider: 'watsonx', modelId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(msg.includes('watsonx') ? msg : `watsonx: ${msg}`)
  }
}

export function getServerWatsonxCredentials(): WatsonxCredentials {
  return {
    apiKey: process.env.WATSONX_API_KEY,
    projectId: process.env.WATSONX_PROJECT_ID,
    baseUrl: process.env.WATSONX_URL ?? WATSONX_DEFAULT_URL,
    modelId: process.env.WATSONX_MODEL ?? DEFAULT_MODEL,
  }
}

export function extractWatsonxCredentialsFromHeaders(
  headers: Record<string, string | string[] | undefined>,
  serverCreds: WatsonxCredentials = getServerWatsonxCredentials()
): WatsonxCredentials {
  const byok = headerValue(headers, 'x-bob-byok') === 'true'

  if (!byok) {
    return serverCreds
  }

  const userApiKey = headerValue(headers, 'x-user-watsonx-api-key')
  const userProjectId = headerValue(headers, 'x-user-watsonx-project-id')
  const userUrl = headerValue(headers, 'x-user-watsonx-url')
  const userModel = headerValue(headers, 'x-user-watsonx-model')

  return {
    apiKey: userApiKey || undefined,
    projectId: userProjectId || undefined,
    baseUrl: userUrl || serverCreds.baseUrl || WATSONX_DEFAULT_URL,
    modelId: userModel || serverCreds.modelId || DEFAULT_MODEL,
  }
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string {
  const raw = headers[name]
  if (Array.isArray(raw)) return raw[0] ?? ''
  return raw ?? ''
}
