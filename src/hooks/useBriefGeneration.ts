import { useRef, useState } from 'react'
import type { Brief, BriefDirection, EventFormData, SectionKey, ToneControls } from '../types/brief'
import { buildFullPrompt, buildSectionPrompt } from '../lib/prompt'
import { callPipeline, callMultiDirection, callMerge } from '../lib/ibmBob'
import { parseBriefJSON, parseSectionJSON } from '../lib/parseBrief'
import { saveToHistory } from '../lib/history'

export function useBriefGeneration() {
  const [isLoading, setIsLoading] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [regenLoading, setRegenLoading] = useState<Partial<Record<SectionKey, boolean>>>({})
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  function beginRequest() {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    return abortRef.current.signal
  }

  function cancel() {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
    setIsMerging(false)
    setProgress(null)
    setError(null)
  }

  function isCancelled(err: unknown): boolean {
    return err instanceof Error && err.message === 'Generation cancelled.'
  }

  async function generateBrief(form: EventFormData, tone?: ToneControls): Promise<Brief | null> {
    setIsLoading(true)
    setError(null)
    setProgress(null)
    const signal = beginRequest()
    try {
      const raw = await callPipeline({ prompt: buildFullPrompt(form, tone) }, signal)
      const result = parseBriefJSON(raw)
      saveToHistory(form, result)
      return result
    } catch (err) {
      if (isCancelled(err)) return null
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[generateBrief]', err)
      setError(`Something went wrong generating the brief: ${msg}`)
      return null
    } finally {
      setIsLoading(false)
      setProgress(null)
    }
  }

  async function generateDirections(
    form: EventFormData,
    tone?: ToneControls
  ): Promise<BriefDirection[] | null> {
    setIsLoading(true)
    setError(null)
    setProgress({ completed: 0, total: 3 })
    const signal = beginRequest()
    try {
      return await callMultiDirection(form, tone, signal, (completed, total) => {
        setProgress({ completed, total })
      })
    } catch (err) {
      if (isCancelled(err)) return null
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[generateDirections]', err)
      setError(`Something went wrong generating directions: ${msg}`)
      return null
    } finally {
      setIsLoading(false)
      setProgress(null)
    }
  }

  async function mergeBriefs(
    dirA: BriefDirection,
    dirB: BriefDirection,
    form: EventFormData
  ): Promise<Brief | null> {
    setIsMerging(true)
    setError(null)
    const signal = beginRequest()
    try {
      const result = await callMerge(dirA, dirB, signal)
      saveToHistory(form, result)
      return result
    } catch (err) {
      if (isCancelled(err)) return null
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[mergeBriefs]', err)
      setError(`Something went wrong merging directions: ${msg}`)
      return null
    } finally {
      setIsMerging(false)
    }
  }

  async function regenerateSection<K extends SectionKey>(
    section: K,
    form: EventFormData,
    currentBrief: Brief,
    tone?: ToneControls
  ): Promise<Brief | null> {
    setRegenLoading(prev => ({ ...prev, [section]: true }))
    setError(null)
    const signal = beginRequest()
    try {
      const raw = await callPipeline({ prompt: buildSectionPrompt(section, form, tone), section }, signal)
      const updated = parseSectionJSON(raw, section)
      return { ...currentBrief, [section]: updated }
    } catch (err) {
      if (isCancelled(err)) return null
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[regenerateSection]', err)
      setError(`Couldn't regenerate ${section}: ${msg}`)
      return null
    } finally {
      setRegenLoading(prev => ({ ...prev, [section]: false }))
    }
  }

  return {
    generateBrief,
    generateDirections,
    mergeBriefs,
    regenerateSection,
    cancel,
    isLoading,
    isMerging,
    regenLoading,
    progress,
    error,
    clearError: () => setError(null),
  }
}
