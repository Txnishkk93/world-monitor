'use client'

import { useState } from 'react'
import { Maximize2, Minimize2, Grid3X3, LayoutList } from 'lucide-react'

interface WebcamFeed {
  id: string
  location: string
  region: string
  embedUrl: string
  status: 'live' | 'offline'
}

const WEBCAM_FEEDS: WebcamFeed[] = [
  { id: 'jerusalem1', location: 'Jerusalem, Israel', region: 'MIDEAST', embedUrl: 'https://www.youtube.com/embed/77akujLn4k8?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1', status: 'live' },
  { id: 'telaviv1', location: 'Tel Aviv, Israel', region: 'MIDEAST', embedUrl: 'https://www.youtube.com/embed/qhhFRi8BcSU?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1', status: 'live' },
  { id: 'dubai1', location: 'Dubai, UAE', region: 'MIDEAST', embedUrl: 'https://www.youtube.com/embed/4e0FdpZa5oA?si=X5A7zibIgg4u7HdA', status: 'live' },
  { id: 'london1', location: 'London, UK', region: 'EUROPE', embedUrl: 'https://www.youtube.com/embed/8JCk5M_xrBs?si=M3-YrXM9R5LlZP2D', status: 'live' },
  { id: 'taipei1', location: 'IRAN', region: 'MIDEAST', embedUrl: 'https://www.youtube.com/embed/Pdwghh0hZ3E?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1', status: 'live' },
]

const REGIONS = ['ALL', 'MIDEAST', 'EUROPE', 'AMERICAS', 'ASIA']

interface LiveWebcamsProps {
  isExpanded: boolean
  onToggleExpand: () => void
}

export default function LiveWebcams({ isExpanded, onToggleExpand }: LiveWebcamsProps) {
  const [activeRegion, setActiveRegion] = useState('ALL')
  const [gridMode, setGridMode] = useState<'grid' | 'list'>('grid')
  const [selectedFeed, setSelectedFeed] = useState<WebcamFeed | null>(null)

  const filteredFeeds = activeRegion === 'ALL'
    ? WEBCAM_FEEDS
    : WEBCAM_FEEDS.filter((f) => f.region === activeRegion)

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0]">LIVE WEBCAMS</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setGridMode(gridMode === 'grid' ? 'list' : 'grid')}
            className="p-1 text-[#666] hover:text-[#ccc] transition-colors"
            title={gridMode === 'grid' ? 'List view' : 'Grid view'}
          >
            {gridMode === 'grid' ? <Grid3X3 size={12} /> : <LayoutList size={12} />}
          </button>
          <button
            onClick={onToggleExpand}
            className="p-1 text-[#666] hover:text-[#ccc] transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Region tabs */}
      <div className="flex items-center gap-0 px-2 py-1.5 border-b border-[#1e1e1e] overflow-x-auto scrollbar-thin shrink-0">
        {REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => { setActiveRegion(region); setSelectedFeed(null) }}
            className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider border shrink-0 transition-colors ${activeRegion === region
                ? 'bg-[#dc2626] text-[#fff] border-[#dc2626]'
                : 'border-transparent text-[#666] hover:text-[#999]'
              }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Selected feed (large view) */}
      {selectedFeed && (
        <div className="relative bg-[#000] shrink-0" style={{ height: isExpanded ? '300px' : '160px' }}>
          <iframe
            src={selectedFeed.embedUrl.replace('autoplay=0', 'autoplay=1')}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={selectedFeed.location}
          />
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-[#000]/70 px-2 py-1 rounded backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse-glow" />
            <span className="text-[9px] text-[#ccc] font-bold tracking-wider">{selectedFeed.location}</span>
          </div>
          <button
            onClick={() => setSelectedFeed(null)}
            className="absolute top-2 right-2 z-10 p-1 bg-[#000]/70 text-[#999] hover:text-[#fff] rounded backdrop-blur-sm"
          >
            <Minimize2 size={10} />
          </button>
        </div>
      )}

      {/* Webcam grid */}
      <div className={`flex-1 overflow-y-auto scrollbar-thin p-1.5 ${gridMode === 'grid' ? 'grid grid-cols-2 gap-1.5' : 'flex flex-col gap-1.5'
        }`}>
        {filteredFeeds.map((feed) => (
          <button
            key={feed.id}
            onClick={() => setSelectedFeed(selectedFeed?.id === feed.id ? null : feed)}
            className={`relative bg-[#000] rounded overflow-hidden aspect-video text-left group border transition-colors ${selectedFeed?.id === feed.id ? 'border-[#ef4444]' : 'border-transparent hover:border-[#333]'
              }`}
          >
            <iframe
              src={feed.embedUrl}
              className="absolute inset-0 w-full h-full pointer-events-none"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope"
              title={feed.location}
              loading="lazy"
              tabIndex={-1}
            />
            {/* Click overlay */}
            <div className="absolute inset-0 z-10" />
            {/* Location overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#000]/90 to-transparent p-1.5 z-20">
              <div className="flex items-center gap-1">
                {feed.status === 'live' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse-glow" />
                )}
                <span className="text-[8px] text-[#ccc] font-bold tracking-wider">{feed.location}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
