import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { sendChatMessage, getSelectedProfileId } from '../services/api'
import { loadChatHistory, saveChatHistory } from '../services/storage'
import type { ChatMessage } from '../types/youth'

export function AgentPage() {
  const { t } = useTranslation()
  const profileId = getSelectedProfileId() || undefined
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory(profileId))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    saveChatHistory(messages, profileId)
  }, [messages, profileId])

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const result = await sendChatMessage(userMsg.content, 'en', getSelectedProfileId() || undefined)
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        source: result.source,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I could not connect to the AI service. Please ensure the backend is running.',
          timestamp: new Date().toISOString(),
          source: 'error',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="text-primary-600" size={28} />
          {t('agent.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Your persistent career coach — ask about skills, goals, opportunities, or next steps.
        </p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Bot size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Start a conversation with your career agent</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  'What are my top skill gaps?',
                  'Suggest my next career steps',
                  'Which jobs should I apply to?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-primary-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.source && msg.source !== 'bedrock' && (
                  <p className="text-[10px] mt-1 opacity-60">via {msg.source}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                  <User size={16} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-primary-600" />
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <Loader2 size={16} className="animate-spin text-primary-600" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('agent.placeholder')}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
