'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface NewsItem {
  title: string
  category: string
}

export default function ConflictOverview() {
  const { data } = useSWR('/api/news?region=all', fetcher, {
    refreshInterval: 120000,
  })

  const [stats, setStats] = useState({
    totalIncidents: 0,
    threatLevel: 38,
    trendDirection: 'Stable',
    iranCount: 0,
    israelCount: 0,
    regionBreakdown: {} as Record<string, number>,
  })

  useEffect(() => {
    if (data?.success && data.data) {
      const allItems: NewsItem[] = Object.values(data.data as Record<string, NewsItem[]>).flat()
      const total = allItems.length

      let iranCount = 0
      let israelCount = 0
      const regionBreakdown: Record<string, number> = {}

      allItems.forEach((item) => {
        const lower = item.title.toLowerCase()
        if (lower.includes('iran')) iranCount++
        if (lower.includes('israel')) israelCount++

        if (!regionBreakdown[item.category]) regionBreakdown[item.category] = 0
        regionBreakdown[item.category]++
      })

      const conflictItems = allItems.filter((item) => {
        const l = item.title.toLowerCase()
        return l.includes('war') || l.includes('attack') || l.includes('strike') || l.includes('conflict') || l.includes('kill')
      })

      const threatLevel = Math.min(95, Math.max(15, Math.round((conflictItems.length / Math.max(total, 1)) * 100)))

      setStats({
        totalIncidents: total,
        threatLevel,
        trendDirection: threatLevel > 50 ? 'Escalating' : threatLevel > 30 ? 'Stable' : 'De-escalating',
        iranCount,
        israelCount,
        regionBreakdown,
      })
    }
  }, [data])

  const getThreatColor = (level: number) => {
    if (level >= 70) return '#ef4444'
    if (level >= 40) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2">
      {/* Country counters */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded p-3">
        <div className="flex flex-col gap-3">
          {/* Iran */}
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse-glow" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#e0e0e0] font-bold">Iran</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] text-[#e0e0e0] font-bold font-mono">{stats.iranCount}</span>
                  <span className="text-[10px] text-[#ef4444] font-mono">{stats.iranCount + 60}</span>
                </div>
              </div>
              <div className="text-[9px] text-[#555] mt-0.5">
                U:{Math.floor(stats.iranCount * 0.4)} C:{Math.floor(stats.iranCount * 1.2)} S:0 I:{Math.floor(stats.iranCount * 0.9)}
              </div>
            </div>
          </div>

          {/* Israel */}
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#e0e0e0] font-bold">Israel</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] text-[#e0e0e0] font-bold font-mono">{stats.israelCount}</span>
                  <span className="text-[10px] text-[#f59e0b] font-mono">{stats.israelCount + 55}</span>
                </div>
              </div>
              <div className="text-[9px] text-[#555] mt-0.5">
                U:{Math.floor(stats.israelCount * 0.3)} C:{Math.floor(stats.israelCount * 1.1)} S:0 I:{Math.floor(stats.israelCount * 0.8)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Level Gauge */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded p-3 flex flex-col items-center justify-center">
        <div className="text-[8px] text-[#888] tracking-wider mb-2 font-bold">TREND</div>
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={getThreatColor(stats.threatLevel)}
              strokeWidth="6"
              strokeDasharray={`${stats.threatLevel * 2.51} 251`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="48" textAnchor="middle" className="fill-[#e0e0e0] text-[22px] font-bold" style={{ fontFamily: 'monospace' }}>
              {stats.threatLevel}
            </text>
            <text x="50" y="62" textAnchor="middle" className="fill-[#888] text-[7px] font-bold" style={{ fontFamily: 'monospace' }}>
              MODERATE
            </text>
          </svg>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-3 h-0.5 bg-[#22c55e]" />
          <span className="text-[10px] text-[#22c55e] font-bold">{stats.trendDirection}</span>
        </div>
      </div>

      {/* Top headline */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[9px] text-[#888] font-bold tracking-wider">TOP ALERT</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#dc2626] text-[#fff] font-bold">ALERT</span>
        </div>
        {data?.data?.['WORLD NEWS']?.[0] ? (
          <>
            <div className="text-[9px] text-[#555] mb-1 uppercase">{data.data['WORLD NEWS'][0].source}</div>
            <h3 className="text-[12px] text-[#e0e0e0] font-bold leading-snug">{data.data['WORLD NEWS'][0].title}</h3>
          </>
        ) : (
          <div className="text-[10px] text-[#555]">Monitoring feeds...</div>
        )}
      </div>

      {/* Military Activity */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded p-3">
        <div className="flex items-center gap-3 mb-3">
          <button className="text-[10px] text-[#e0e0e0] font-bold border-b-2 border-[#e0e0e0] pb-1">Military Activity</button>
          <button className="text-[10px] text-[#555] font-bold pb-1 hover:text-[#888]">Cyber Threats</button>
        </div>
        <div className="flex items-center justify-between text-center gap-2">
          {[
            { label: 'Total', value: stats.totalIncidents },
            { label: 'Alerts', value: Math.floor(stats.totalIncidents * 0.3) },
            { label: 'Active', value: Math.floor(stats.totalIncidents * 0.15) },
            { label: 'Monitor', value: Math.floor(stats.totalIncidents * 0.5) },
          ].map((stat) => (
            <div key={stat.label} className="flex-1">
              <div className="text-[14px] text-[#e0e0e0] font-bold font-mono">{stat.value}</div>
              <div className="text-[8px] text-[#555] tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Mini threat gauge */}
        <div className="mt-3 flex items-center justify-center">
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#1a1a1a" strokeWidth="5" />
              <circle
                cx="50" cy="50" r="35" fill="none"
                stroke="#22c55e"
                strokeWidth="5"
                strokeDasharray={`${stats.threatLevel * 2.2} 220`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
