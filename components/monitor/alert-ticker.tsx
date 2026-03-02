'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface NewsItem {
  title: string
  source: string
}

export default function AlertTicker() {
  const { data } = useSWR('/api/news?region=all', fetcher, {
    refreshInterval: 120000,
  })

  const [headlines, setHeadlines] = useState<{ title: string; source: string; severity: string }[]>([])

  useEffect(() => {
    if (data?.success && data.data) {
      const allItems: NewsItem[] = Object.values(data.data as Record<string, NewsItem[]>).flat()
      const mapped = allItems.slice(0, 20).map((item) => {
        const lower = item.title.toLowerCase()
        let severity = 'low'
        if (lower.includes('war') || lower.includes('attack') || lower.includes('strike') || lower.includes('kill') || lower.includes('dead') || lower.includes('bomb')) {
          severity = 'high'
        } else if (lower.includes('military') || lower.includes('conflict') || lower.includes('troop') || lower.includes('sanction')) {
          severity = 'medium'
        }
        return { title: item.title, source: item.source, severity }
      })
      setHeadlines(mapped)
    }
  }, [data])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-[#ef4444]'
      case 'medium': return 'text-[#d97706]'
      default: return 'text-[#888]'
    }
  }

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-[#ef4444]'
      case 'medium': return 'bg-[#d97706]'
      default: return 'bg-[#444]'
    }
  }

  if (headlines.length === 0) return null

  return (
    <div className="bg-[#0d0d0d] border-b border-[#1a1a1a] overflow-hidden h-6 flex items-center shrink-0">
      <div className="flex items-center gap-2 px-2 shrink-0 border-r border-[#1a1a1a]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse-glow" />
        <span className="text-[9px] text-[#ef4444] font-bold tracking-wider">ALERTS</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="flex items-center gap-8 animate-ticker whitespace-nowrap">
          {[...headlines, ...headlines].map((h, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${getSeverityDot(h.severity)}`} />
              <span className={`text-[9px] font-bold ${getSeverityColor(h.severity)}`}>{h.source}</span>
              <span className="text-[9px] text-[#999]">{h.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
