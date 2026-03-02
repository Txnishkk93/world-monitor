'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  contentSnippet?: string
  source: string
  category: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hours ago`
  const days = Math.floor(hrs / 24)
  return `${days} days ago`
}

function getTagColor(tag: string): string {
  switch (tag.toUpperCase()) {
    case 'ALERT': return 'bg-[#dc2626] text-[#fff]'
    case 'CONFLICT': return 'bg-[#d97706] text-[#fff]'
    case 'MILITARY': return 'bg-[#3b82f6] text-[#fff]'
    case 'DIPLOMATIC': return 'bg-[#22c55e] text-[#fff]'
    case 'WIRE': return 'bg-[#22c55e] text-[#000]'
    default: return 'bg-[#333] text-[#ccc]'
  }
}

function detectTags(title: string, source: string): string[] {
  const tags: string[] = []
  const lowerTitle = title.toLowerCase()

  if (lowerTitle.includes('war') || lowerTitle.includes('attack') || lowerTitle.includes('strike') ||
      lowerTitle.includes('missile') || lowerTitle.includes('bomb') || lowerTitle.includes('kill') ||
      lowerTitle.includes('dead') || lowerTitle.includes('death')) {
    tags.push('ALERT')
  }
  if (lowerTitle.includes('conflict') || lowerTitle.includes('military') || lowerTitle.includes('troop') ||
      lowerTitle.includes('force') || lowerTitle.includes('weapon') || lowerTitle.includes('army') ||
      lowerTitle.includes('navy') || lowerTitle.includes('battle')) {
    tags.push('CONFLICT')
  }
  if (lowerTitle.includes('missile') || lowerTitle.includes('nuclear') || lowerTitle.includes('defense') ||
      lowerTitle.includes('pentagon') || lowerTitle.includes('military')) {
    tags.push('MILITARY')
  }
  if (lowerTitle.includes('diplomat') || lowerTitle.includes('treaty') || lowerTitle.includes('agreement') ||
      lowerTitle.includes('summit') || lowerTitle.includes('negotiat')) {
    tags.push('DIPLOMATIC')
  }
  if (source.includes('REUTERS') || source.includes('AP')) {
    tags.push('WIRE')
  }

  return [...new Set(tags)].slice(0, 3)
}

const CATEGORY_ORDER = [
  'WORLD NEWS',
  'UNITED STATES',
  'EUROPE',
  'MIDDLE EAST',
  'AFRICA',
  'LATIN AMERICA',
  'ASIA-PACIFIC',
  'ENERGY & RESOURCES',
  'GOVERNMENT',
  'THINK TANKS',
]

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const tags = detectTags(item.title, item.source)

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-2.5 hover:bg-[#1a1a1a] transition-colors ${
        index > 0 ? 'border-t border-[#1a1a1a]' : ''
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
        <span className="text-[9px] text-[#888] font-bold tracking-wider uppercase">{item.source}</span>
        {tags.map((tag) => (
          <span key={tag} className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${getTagColor(tag)}`}>
            {tag}
          </span>
        ))}
      </div>
      <h4 className="text-[11px] text-[#e0e0e0] leading-snug font-medium line-clamp-2">{item.title}</h4>
      <span className="text-[9px] text-[#555] mt-1 block">{timeAgo(item.pubDate)}</span>
    </a>
  )
}

function CategoryPanel({ category, items }: { category: string; items: NewsItem[] }) {
  const count = items.length
  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0] uppercase">{category}</h3>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#22c55e] text-[#000] font-bold">LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#555]">{count}</span>
        </div>
      </div>
      {/* Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin max-h-[240px]">
        {items.length > 0 ? (
          items.map((item, i) => <NewsCard key={`${item.link}-${i}`} item={item} index={i} />)
        ) : (
          <div className="p-4 text-center text-[10px] text-[#555]">Loading feeds...</div>
        )}
      </div>
    </div>
  )
}

export default function NewsDashboard() {
  const { data, error } = useSWR('/api/news?region=all', fetcher, {
    refreshInterval: 120000,
    revalidateOnFocus: true,
  })

  const [newsData, setNewsData] = useState<Record<string, NewsItem[]>>({})

  useEffect(() => {
    if (data?.success && data.data) {
      setNewsData(data.data)
    }
  }, [data])

  if (error) {
    return (
      <div className="p-4 text-center text-[#555] text-xs">
        Failed to load news feeds. Retrying...
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
        {CATEGORY_ORDER.map((cat) => (
          <CategoryPanel key={cat} category={cat} items={newsData[cat] || []} />
        ))}
      </div>
    </div>
  )
}
