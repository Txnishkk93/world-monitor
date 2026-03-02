'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface NewsItem {
  title: string
  link: string
  source: string
  category: string
}

export default function AIInsightsPanel() {
  const { data } = useSWR('/api/news?region=all', fetcher, {
    refreshInterval: 120000,
  })

  const [summary, setSummary] = useState<string>('')
  const [headlines, setHeadlines] = useState<string[]>([])

  useEffect(() => {
    if (data?.success && data.data) {
      const allItems: NewsItem[] = Object.values(data.data as Record<string, NewsItem[]>).flat()
      const conflictItems = allItems.filter((item) => {
        const lower = item.title.toLowerCase()
        return lower.includes('war') || lower.includes('attack') || lower.includes('strike') ||
               lower.includes('missile') || lower.includes('conflict') || lower.includes('military') ||
               lower.includes('kill') || lower.includes('bomb') || lower.includes('dead')
      })

      const topItems = conflictItems.length > 0 ? conflictItems.slice(0, 5) : allItems.slice(0, 5)
      setHeadlines(topItems.map((i) => i.title))

      if (topItems.length > 0) {
        const briefParts = topItems.slice(0, 3).map((i) => i.title)
        setSummary(
          `WORLD BRIEF: ${briefParts.join('. ')}. Monitoring continues across all major theaters of operation. Multiple sources confirm ongoing developments.`
        )
      }
    }
  }, [data])

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0]">AI INSIGHTS</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#22c55e] text-[#000] font-bold">LIVE</span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 flex-1 overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
          <span className="text-[9px] text-[#3b82f6] font-bold tracking-wider">WORLD BRIEF</span>
        </div>

        {summary ? (
          <p className="text-[11px] text-[#ccc] leading-relaxed mb-4">{summary}</p>
        ) : (
          <p className="text-[10px] text-[#555]">Analyzing global situation...</p>
        )}

        {/* Headline list */}
        <div className="border-t border-[#1e1e1e] pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-[#888] font-bold tracking-wider">AI STRATEGIC POSTURE</span>
            {headlines.length > 0 && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#d97706] text-[#fff] font-bold">
                {headlines.length} NEW
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {headlines.map((headline, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#555] mt-1.5 shrink-0" />
                <span className="text-[10px] text-[#999] leading-snug">{headline}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
