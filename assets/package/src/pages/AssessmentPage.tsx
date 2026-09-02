import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Brain, Target, ArrowRight, Loader2 } from 'lucide-react'
import { runAssessment, runGapAnalysis, getNextActions, getSelectedProfileId } from '../services/api'

type Tab = 'assessment' | 'gaps' | 'actions'

export function AssessmentPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('assessment')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')

  async function run(tabKey: Tab) {
    setTab(tabKey)
    setLoading(true)
    setResult('')
    const profileId = getSelectedProfileId() || undefined
    try {
      let res
      if (tabKey === 'assessment') {
        res = await runAssessment('en', profileId)
        setResult(res.assessment)
        setSource(res.source)
      } else if (tabKey === 'gaps') {
        res = await runGapAnalysis(profileId)
        setResult(res.analysis)
        setSource(res.source)
      } else {
        res = await getNextActions(profileId)
        setResult(res.actions)
        setSource(res.source)
      }
    } catch {
      setResult('Failed to connect to the AI service. Please ensure the backend is running on port 8000.')
      setSource('error')
    } finally {
      setLoading(false)
    }
  }

  const tabs: { key: Tab; label: string; icon: typeof Brain }[] = [
    { key: 'assessment', label: t('assessment.title'), icon: Brain },
    { key: 'gaps', label: t('assessment.gapAnalysis'), icon: Target },
    { key: 'actions', label: t('assessment.nextActions'), icon: ArrowRight },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('assessment.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered career assessment powered by Amazon Bedrock
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => run(key)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={32} className="animate-spin text-primary-600 mb-3" />
            <p className="text-sm">{t('assessment.running')}</p>
          </div>
        ) : result ? (
          <div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{result}</p>
            {source && (
              <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                Generated via {source === 'bedrock' ? 'Amazon Bedrock' : source}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Brain size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Select an assessment type above to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
