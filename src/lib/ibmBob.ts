import { SYSTEM_PROMPT, buildDirectionPrompt, buildMergePrompt, getDirectionLabel } from './prompt'
import { parseBriefJSON } from './parseBrief'
import { getBriefAuthHeaders } from './userKeys'
import type { Brief, BriefDirection, EventFormData, ToneControls } from '../types/brief'

const API_URL = '/api/brief'
const REQUEST_TIMEOUT_MS = 90_000
const MAX_RETRIES = 4
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

/** watsonx Lite allows few concurrent requests per model — serialize client calls. */
let requestChain: Promise<unknown> = Promise.resolve()

function enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
  const run = requestChain.then(fn, fn)
  requestChain = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

function retryDelayMs(attempt: number, status?: number): number {
  if (status === 429) return [3000, 8000, 15000, 25000][attempt] ?? 25000
  return 800 * (attempt + 1)
}

// Two-pass pipeline: creative generation → JSON schema enforcement (watsonx / IBM Granite)
//   Pass 1 — creative prose at higher temperature
//   Pass 2 — JSON schema enforcement at temperature 0
export async function callPipeline(
  payload: { prompt: string; section?: string },
  signal?: AbortSignal
): Promise<string> {
  const creativeProse = await chatCompletion(
    {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: payload.prompt },
      ],
      temperature: 0.8,
    },
    signal,
    'pass 1'
  )

  const schemaPrompt = payload.section
    ? buildSectionSchemaPrompt(creativeProse, payload.section)
    : buildFullSchemaPrompt(creativeProse)

  return chatCompletion(
    {
      messages: [
        {
          role: 'system',
          content:
            'You are a JSON schema enforcer. Extract the information from the creative brief text and return it as valid JSON matching the exact schema provided. No extra keys, no markdown, no explanation — only the JSON object.',
        },
        { role: 'user', content: schemaPrompt },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    },
    signal,
    'pass 2'
  )
}

async function chatCompletion(
  body: Record<string, unknown>,
  signal: AbortSignal | undefined,
  label: string
): Promise<string> {
  return enqueueRequest(() => chatCompletionOnce(body, signal, label))
}

async function chatCompletionOnce(
  body: Record<string, unknown>,
  signal: AbortSignal | undefined,
  label: string
): Promise<string> {
  let lastError: Error | null = null
  let lastStatus: number | undefined

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    const onAbort = () => controller.abort()
    signal?.addEventListener('abort', onAbort)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getBriefAuthHeaders(),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errText = await res.text()
        lastStatus = res.status
        if (RETRYABLE_STATUSES.has(res.status) && attempt < MAX_RETRIES) {
          await delay(retryDelayMs(attempt, res.status))
          continue
        }
        throw new Error(`Error (${label}): ${res.status} — ${errText}`)
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string' || !content.trim()) {
        throw new Error(`Error (${label}): empty response from AI.`)
      }
      return content
    } catch (err) {
      if (signal?.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
        throw new Error('Generation cancelled.')
      }
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < MAX_RETRIES && isRetryableError(lastError)) {
        await delay(retryDelayMs(attempt, lastStatus))
        continue
      }
      throw lastError
    } finally {
      clearTimeout(timeout)
      signal?.removeEventListener('abort', onAbort)
    }
  }

  throw lastError ?? new Error(`Error (${label}): request failed.`)
}

function isRetryableError(err: Error): boolean {
  return /429|50[0234]|network|fetch/i.test(err.message)
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function callMultiDirection(
  form: EventFormData,
  tone: ToneControls | undefined,
  signal?: AbortSignal,
  onProgress?: (completed: number, total: number) => void
): Promise<BriefDirection[]> {
  const ids = ['A', 'B', 'C'] as const
  const directions: BriefDirection[] = []
  const failures: string[] = []

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    try {
      const raw = await callPipeline({ prompt: buildDirectionPrompt(form, tone, id) }, signal)
      const brief = parseBriefJSON(raw)
      directions.push({ id, label: getDirectionLabel(id), brief })
      onProgress?.(i + 1, ids.length)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      failures.push(`Direction ${id}: ${msg}`)
    }
  }

  if (directions.length === 0) {
    throw new Error(failures.join(' · ') || 'All direction generations failed.')
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} direction(s) failed. ${failures.join(' · ')}`)
  }

  return directions
}

export async function callMerge(dirA: BriefDirection, dirB: BriefDirection, signal?: AbortSignal): Promise<Brief> {
  const raw = await callPipeline(
    { prompt: buildMergePrompt(dirA.label, dirA.brief, dirB.label, dirB.brief) },
    signal
  )
  return parseBriefJSON(raw)
}

function buildFullSchemaPrompt(prose: string): string {
  return `Extract the information from the creative brief text below and return it as valid JSON matching this exact schema. No extra keys, no markdown.

Schema:
{
  "theme": { "concept": "string", "moodboard_keywords": ["string x5"] },
  "palette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "rationale": "string" },
  "copy": { "tagline": "string", "headline": "string", "body_angle": "string" },
  "sponsor_deck": { "value_proposition": "string", "audience_snapshot": "string", "tier_names": ["string x3"] },
  "logistics_notes": { "suggested_venue_type": "string", "key_production_elements": ["string x3"], "watch_out": "string" } — use sentence case for all logistics strings
}

Creative brief text:
${prose}`
}

function buildSectionSchemaPrompt(prose: string, section: string): string {
  const schemas: Record<string, string> = {
    theme: `{ "concept": "string", "moodboard_keywords": ["string x5"] }`,
    palette: `{ "primary": "#hex", "secondary": "#hex", "accent": "#hex", "rationale": "string" }`,
    copy: `{ "tagline": "string", "headline": "string", "body_angle": "string" }`,
    sponsor_deck: `{ "value_proposition": "string", "audience_snapshot": "string", "tier_names": ["string x3"] }`,
    logistics_notes: `{ "suggested_venue_type": "string", "key_production_elements": ["string x3"], "watch_out": "string" }`,
  }

  return `Extract the "${section}" section from the text below and return it as valid JSON matching this exact schema. No extra keys, no markdown.

Schema: ${schemas[section] ?? '{}'}

Text:
${prose}`
}
