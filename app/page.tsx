'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useCallback, useEffect } from 'react'
import TopNav from '@/components/monitor/top-nav'
import AlertTicker from '@/components/monitor/alert-ticker'
import NewsDashboard from '@/components/monitor/news-dashboard'
import ConflictOverview from '@/components/monitor/conflict-overview'
import LiveNewsPanel from '@/components/monitor/live-news-panel'
import LiveWebcams from '@/components/monitor/live-webcams'
import MarketsPanel from '@/components/monitor/markets-panel'
import AIInsightsPanel from '@/components/monitor/ai-insights-panel'

const WorldMap = dynamic(() => import('@/components/monitor/world-map'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-[10px] text-[#555] tracking-wider">LOADING MAP...</div>
    </div>
  ),
})

const MIN_MAP_HEIGHT = 180
const MAX_MAP_HEIGHT = 800
const DEFAULT_MAP_HEIGHT = 420

export default function MonitorPage() {
  const [activeView, setActiveView] = useState<'map' | 'news'>('map')
  const [expandedPanel, setExpandedPanel] = useState<'news' | 'webcams' | null>(null)
  const [mapHeight, setMapHeight] = useState(DEFAULT_MAP_HEIGHT)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(DEFAULT_MAP_HEIGHT)

  const onDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true)
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      dragStartY.current = clientY
      dragStartHeight.current = mapHeight
      e.preventDefault()
    },
    [mapHeight]
  )

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return
      const clientY =
        'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
      const delta = clientY - dragStartY.current
      const next = Math.min(
        MAX_MAP_HEIGHT,
        Math.max(MIN_MAP_HEIGHT, dragStartHeight.current + delta)
      )
      setMapHeight(next)
    }
    const onUp = () => setIsDragging(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [isDragging])

  return (
    <div
      className="flex flex-col bg-[#0a0a0a] min-h-screen overflow-y-auto overflow-x-hidden"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* Sticky top chrome */}
      <div className="sticky top-0 z-50 flex flex-col">
        <TopNav activeView={activeView} onViewChange={setActiveView} />
        <AlertTicker />
      </div>

      {activeView === 'map' ? (
        <>
          {/* Situation bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d0d] border-b border-[#1a1a1a]">
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0]">
              GLOBAL SITUATION
            </span>
            <span className="text-[10px] text-[#888] font-mono">
              {new Date().toUTCString().replace('GMT', 'UTC')}
            </span>
          </div>

          {/* World Map — resizable */}
          <div
            className="relative w-full shrink-0"
            style={{
              height: mapHeight,
              transition: isDragging ? 'none' : 'height 0.12s ease',
            }}
          >
            <WorldMap />
          </div>

          {/* Drag handle */}
          <div
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            className="group relative flex items-center justify-center w-full shrink-0 select-none z-20"
            style={{
              height: 20,
              cursor: 'row-resize',
              background: isDragging
                ? 'linear-gradient(to right, transparent, rgba(239,68,68,0.12), transparent)'
                : 'linear-gradient(to right, transparent, #161616, transparent)',
              borderTop: '1px solid #1c1c1c',
              borderBottom: '1px solid #1c1c1c',
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-full mx-0.5 transition-all duration-150"
                style={{
                  width: 3,
                  height: 3,
                  background: isDragging ? '#ef4444' : '#3a3a3a',
                  boxShadow: isDragging ? '0 0 5px #ef4444' : 'none',
                  transform: isDragging ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-7 text-[8px] tracking-widest px-2 py-0.5 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              style={{ background: '#111', color: '#666', border: '1px solid #252525' }}
            >
              ↕ DRAG TO RESIZE MAP
            </div>
          </div>

          {/* Section label */}
          <div className="flex items-center gap-3 px-3 py-2 bg-[#0d0d0d] border-b border-[#1a1a1a]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#555]">
              LIVE FEEDS &amp; INTELLIGENCE
            </span>
            <div className="ml-auto text-[8px] text-[#2d2d2d] tracking-wider">
              SCROLL ↓
            </div>
          </div>

          {/* Bottom panels — full natural height, page scrolls to show them */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1a1a1a]">
            {/* Live News */}
            <div
              className="flex flex-col overflow-hidden transition-[min-height] duration-300"
              style={{ minHeight: expandedPanel === 'news' ? 780 : 560 }}
            >
              <LiveNewsPanel
                isExpanded={expandedPanel === 'news'}
                onToggleExpand={() =>
                  setExpandedPanel(expandedPanel === 'news' ? null : 'news')
                }
              />
            </div>

            {/* Live Webcams */}
            <div
              className="flex flex-col overflow-hidden transition-[min-height] duration-300"
              style={{ minHeight: expandedPanel === 'webcams' ? 780 : 560 }}
            >
              <LiveWebcams
                isExpanded={expandedPanel === 'webcams'}
                onToggleExpand={() =>
                  setExpandedPanel(expandedPanel === 'webcams' ? null : 'webcams')
                }
              />
            </div>

            {/* AI Insights */}
            <div className="flex flex-col" style={{ minHeight: 560 }}>
              <AIInsightsPanel />
            </div>
          </div>

          {/* Footer strip */}
          <div className="h-10 bg-[#080808] border-t border-[#141414] flex items-center justify-center">
            <span className="text-[8px] tracking-[0.25em] text-[#1e1e1e]">
              GLOBAL THREAT MONITOR · ACLED · CFR · IISS · {new Date().getFullYear()}
            </span>
          </div>
        </>
      ) : (
        /* News grid view */
        <>
          <ConflictOverview />
          <NewsDashboard />
          <div className="p-2">
            <MarketsPanel />
          </div>
          <div className="h-8" />
        </>
      )}
    </div>
  )
}