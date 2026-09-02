import { Map, CheckCircle2, Circle, Clock } from 'lucide-react'
import type { YouthProfile } from '../types/youth'

const STAGE_COLORS: Record<string, string> = {
  goal: 'bg-purple-500',
  profile: 'bg-blue-500',
  skills: 'bg-green-500',
  'gap-analysis': 'bg-amber-500',
  plan: 'bg-indigo-500',
  actions: 'bg-pink-500',
  progress: 'bg-teal-500',
  reassessment: 'bg-orange-500',
}

export function JourneyPage({ data }: { data: YouthProfile }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Map className="text-primary-600" size={28} />
          My Career Journey
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Goal → Profile → Skills → Gap Analysis → Plan → Actions → Progress → Reassessment
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-6">
            {data.journey.map((entry) => (
              <div key={entry.id} className="relative flex gap-4 pl-12">
                <div
                  className={`absolute left-3 w-5 h-5 rounded-full ${STAGE_COLORS[entry.stage] || 'bg-gray-400'} flex items-center justify-center ring-4 ring-white`}
                >
                  <CheckCircle2 size={12} className="text-white" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm">{entry.title}</h3>
                    <span className="text-xs text-gray-400">{entry.date}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                  <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded">
                    {entry.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" /> Milestones
          </h3>
          <div className="space-y-3">
            {data.milestones.map((ms) => (
              <div key={ms.id} className="flex items-center gap-3">
                {ms.status === 'completed' ? (
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                ) : ms.status === 'in-progress' ? (
                  <Clock size={16} className="text-amber-500 shrink-0" />
                ) : (
                  <Circle size={16} className="text-gray-300 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{ms.title}</p>
                  {ms.progress !== undefined && (
                    <div className="mt-1 h-1 bg-gray-100 rounded-full">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${ms.progress}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Next Best Actions</h3>
          <ul className="space-y-2">
            {data.agentMemory.nextBestActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <ArrowRightIcon />
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="text-primary-500 shrink-0 mt-0.5">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
