import { useState, useCallback } from 'react'
import type { Brief, BriefDirection, EventFormData, SectionKey, ToneControls } from './types/brief'
import { DEFAULT_TONE } from './types/brief'
import { useBriefGeneration } from './hooks/useBriefGeneration'
import { loadHistory, saveToHistory } from './lib/history'
import type { BriefRecord } from './lib/history'
import { hasValidUserKeys, loadUserKeys } from './lib/userKeys'
import { HeroPage } from './components/HeroPage'
import { EventForm } from './components/EventForm'
import { BriefDisplay } from './components/BriefDisplay'
import { DirectionPicker } from './components/DirectionPicker'
import { LoadingBrief } from './components/LoadingBrief'
import { ExportButton } from './components/ExportButton'
import { ToneControlsPanel } from './components/ToneControlsPanel'
import { BriefHistory } from './components/BriefHistory'
import { ApiKeySettings } from './components/ApiKeySettings'
import { SiteTopbar } from './components/SiteTopbar'
import { AppFooter } from './components/AppFooter'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Toast, type ToastMessage, type ToastType } from './components/Toast'

type View = 'hero' | 'form' | 'loading' | 'directions' | 'merging' | 'brief'

export default function App() {
  const [view, setView] = useState<View>('hero')
  const [formData, setFormData] = useState<EventFormData | null>(null)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [directions, setDirections] = useState<BriefDirection[] | null>(null)
  const [mergeLabel, setMergeLabel] = useState<string | null>(null)
  const [tone, setTone] = useState<ToneControls>(DEFAULT_TONE)
  const [history, setHistory] = useState<BriefRecord[]>(() => loadHistory())
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const showToast = useCallback((text: string, type: ToastType = 'info') => {
    setToast({ id: Date.now(), text, type })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const {
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
    clearError,
  } = useBriefGeneration()

  function refreshHistory() {
    setHistory(loadHistory())
  }

  function ensureApiKeys(): boolean {
    if (!hasValidUserKeys(loadUserKeys())) {
      showToast('Enable your own keys and add at least one API key', 'error')
      return false
    }
    return true
  }

  async function handleFormSubmit(data: EventFormData) {
    if (!ensureApiKeys()) return
    setFormData(data)
    setView('loading')
    const result = await generateBrief(data, tone)
    if (result) {
      setBrief(result)
      setMergeLabel(null)
      setView('brief')
      refreshHistory()
    } else {
      setView('form')
    }
  }

  async function handleGenerateDirections(data: EventFormData) {
    if (!ensureApiKeys()) return
    setFormData(data)
    setView('loading')
    const dirs = await generateDirections(data, tone)
    if (dirs) {
      setDirections(dirs)
      setView('directions')
    } else {
      setView('form')
    }
  }

  function handleSelectDirection(dir: BriefDirection) {
    if (formData) saveToHistory(formData, dir.brief)
    setBrief(dir.brief)
    setMergeLabel(dir.label)
    setView('brief')
    refreshHistory()
  }

  async function handleMerge(dirA: BriefDirection, dirB: BriefDirection) {
    if (!formData) return
    setView('merging')
    const result = await mergeBriefs(dirA, dirB, formData)
    if (result) {
      setBrief(result)
      setMergeLabel(`${dirA.label} × ${dirB.label}`)
      setView('brief')
      refreshHistory()
    } else {
      setView('directions')
    }
  }

  async function handleRegenSection(section: SectionKey) {
    if (!formData || !brief) return
    const updated = await regenerateSection(section, formData, brief, tone)
    if (updated) setBrief(updated)
  }

  function handleCancelGeneration(fromMerge = false) {
    cancel()
    showToast('Generation cancelled', 'info')
    setView(fromMerge ? 'directions' : formData ? 'form' : 'hero')
  }

  const handleRestoreHistory = useCallback((restoredForm: EventFormData, restoredBrief: Brief) => {
    setFormData(restoredForm)
    setBrief(restoredBrief)
    setMergeLabel(null)
    setView('brief')
  }, [])

  function handleBackToHome() {
    clearError()
    setView('hero')
  }

  function handleStartOver() {
    setBrief(null)
    setDirections(null)
    setFormData(null)
    setMergeLabel(null)
    setView('form')
  }

  return (
    <>
      <Toast toast={toast} onDismiss={dismissToast} />

      {view === 'hero' && (
        <HeroPage onGetStarted={() => setView('form')} />
      )}

      {(view === 'form' || view === 'loading' || view === 'merging') && (
        <div className="app-shell">
          <SiteTopbar onBrandClick={handleBackToHome} />

          <div className="app-container app-container--workspace">
            {view === 'form' && (
              <>
                <div className="app-workspace">
                  <div className="app-workspace-main">
                    <EventForm
                      onSubmit={handleFormSubmit}
                      onGenerateDirections={handleGenerateDirections}
                      isLoading={isLoading}
                      onFieldChange={clearError}
                    />
                    {error && <div className="error-banner">{error}</div>}
                  </div>
                  <aside className="app-workspace-aside">
                    <ToneControlsPanel tone={tone} onChange={setTone} />
                    <BriefHistory
                      records={history}
                      onRestore={handleRestoreHistory}
                      onHistoryChange={refreshHistory}
                    />
                    <ApiKeySettings />
                  </aside>
                </div>
              </>
            )}
            {(view === 'loading' || view === 'merging') && (
              <LoadingBrief
                merging={view === 'merging'}
                progress={progress}
                onCancel={() => handleCancelGeneration(view === 'merging')}
              />
            )}
          </div>
        </div>
      )}

      {view === 'directions' && directions && formData && (
        <div className="app-shell">
          <SiteTopbar onBrandClick={handleBackToHome} />
          <div className="app-container app-container--wide">
            {error && <div className="error-banner">{error}</div>}
            <DirectionPicker
              eventName={formData.eventName}
              directions={directions}
              isMerging={isMerging}
              onSelectOne={handleSelectDirection}
              onMerge={handleMerge}
              onStartOver={handleStartOver}
            />
          </div>
        </div>
      )}

      {view === 'brief' && brief && formData && (
        <div className="app-shell">
          <SiteTopbar onBrandClick={handleBackToHome} />

          <div className="app-container app-container--brief">
            <div className="brief-page">
              <header className="brief-toolbar">
                <div className="brief-title-block">
                  <p className="form-eyebrow">Creative brief</p>
                  <h1 className="brief-page-title">{formData.eventName}</h1>
                  {mergeLabel && (
                    <span className="brief-merge-badge">{mergeLabel}</span>
                  )}
                </div>
                <div className="toolbar-actions">
                  <ExportButton
                    brief={brief}
                    eventName={formData.eventName}
                    onToast={showToast}
                  />
                  <button type="button" className="btn-secondary" onClick={handleStartOver}>
                    ← New Brief
                  </button>
                </div>
              </header>

              {error && <div className="error-banner">{error}</div>}

              <ErrorBoundary onReset={() => setBrief(null)}>
                <BriefDisplay
                  brief={brief}
                  onRegenSection={handleRegenSection}
                  regenLoading={regenLoading}
                />
              </ErrorBoundary>

              <AppFooter />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
