'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
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

export default function MonitorPage() {
  const [activeView, setActiveView] = useState<'map' | 'news'>('map')
  const [expandedPanel, setExpandedPanel] = useState<'news' | 'webcams' | null>(null)

  const panelHeight = expandedPanel ? 520 : 320

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Top Navigation */}
      <TopNav activeView={activeView} onViewChange={setActiveView} />

      {/* Alert Ticker */}
      <AlertTicker />

      {activeView === 'map' ? (
        /* MAP VIEW */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Global Situation Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d0d] border-b border-[#1a1a1a] shrink-0">
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0]">GLOBAL SITUATION</span>
            <span className="text-[10px] text-[#888] font-mono">
              {new Date().toUTCString().replace('GMT', 'UTC')}
            </span>
          </div>

          {/* Map */}
          <div className="flex-1 min-h-0 relative" style={{ minHeight: '200px' }}>
            <WorldMap />
          </div>

          {/* Bottom panels - resizable height */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[#1a1a1a] shrink-0 transition-all duration-300"
            style={{ height: `${panelHeight}px` }}
          >
            {/* Live News */}
            <div className="border-r border-[#1a1a1a] overflow-hidden">
              <LiveNewsPanel
                isExpanded={expandedPanel === 'news'}
                onToggleExpand={() => setExpandedPanel(expandedPanel === 'news' ? null : 'news')}
              />
            </div>

            {/* Live Webcams */}
            <div className="border-r border-[#1a1a1a] overflow-hidden">
              <LiveWebcams
                isExpanded={expandedPanel === 'webcams'}
                onToggleExpand={() => setExpandedPanel(expandedPanel === 'webcams' ? null : 'webcams')}
              />
            </div>

            {/* AI Insights */}
            <div className="overflow-hidden">
              <AIInsightsPanel />
            </div>
          </div>
        </div>
      ) : (
        /* NEWS GRID VIEW */
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Conflict Overview */}
          <ConflictOverview />

          {/* News Grid */}
          <NewsDashboard />

          {/* Markets and commodities */}
          <div className="p-2">
            <MarketsPanel />
          </div>
        </div>
      )}
    </div>
  )
}
