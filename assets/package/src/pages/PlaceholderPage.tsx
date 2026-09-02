import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description?: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Construction size={48} className="mb-4 opacity-40" />
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <p className="text-sm mt-2 max-w-md text-center">
        {description || 'This section is coming soon as part of the MY Bharat platform expansion.'}
      </p>
    </div>
  )
}
