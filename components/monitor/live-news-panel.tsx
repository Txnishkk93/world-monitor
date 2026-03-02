'use client'

import { useState } from 'react'
import { Volume2, VolumeX, Maximize2, Minimize2, ChevronUp, ChevronDown } from 'lucide-react'

const NEWS_CHANNELS = [
  { id: 'cnn', label: 'CNN', color: null, embedUrl: 'https://www.youtube.com/live/cK5uQQf-d04?si=Z3ciXtqPaOovXa1VQ?autoplay=1&mute=MUTE&controls=1&showinfo=0&rel=0&modestbranding=1' },
  { id: 'BBC', label: 'BBC', color: null, embedUrl: 'https://www.youtube.com/live/KyG6amQVSco?si=0k8BtrzdQAiKA3EE' },
  { id: 'aljazeera', label: 'ALJAZEERA', color: '#d97706', embedUrl: 'https://www.youtube.com/live/gCNeDWCI0vo?si=Cs1cNmhQsGhoZQnS' },
  { id: 'france24', label: 'FRANCE24', color: null, embedUrl: 'https://www.youtube.com/live/Ap-UM1O9RBU?si=SkGTjS7aVu4IMxZm' },
  { id: 'dw', label: 'DW', color: null, embedUrl: 'https://www.youtube.com/embed/NvqKZHpKs-g?autoplay=1&mute=MUTE&controls=1&showinfo=0&rel=0&modestbranding=1' },
  { id: 'euronews', label: 'EURONEWS', color: null, embedUrl: 'https://www.youtube.com/embed/pykpO5kQJ98?autoplay=1&mute=MUTE&controls=1&showinfo=0&rel=0&modestbranding=1' },
  { id: 'bloomberg', label: 'BLOOMBERG', color: '#dc2626', embedUrl: 'https://www.youtube.com/embed/dp8PhLsUcFE?autoplay=1&mute=MUTE&controls=1&showinfo=0&rel=0&modestbranding=1' },
  { id: 'alarabiya', label: 'ALARABIYA', color: null, embedUrl: 'https://www.youtube.com/embed/1Uw6ZkbsAH8?autoplay=1&mute=MUTE&controls=1&showinfo=0&rel=0&modestbranding=1' },
]

interface LiveNewsPanelProps {
  isExpanded: boolean
  onToggleExpand: () => void
}

export default function LiveNewsPanel({ isExpanded, onToggleExpand }: LiveNewsPanelProps) {
  const [activeChannel, setActiveChannel] = useState('aljazeera')
  const [isMuted, setIsMuted] = useState(true)

  const currentChannel = NEWS_CHANNELS.find((c) => c.id === activeChannel) || NEWS_CHANNELS[0]
  const embedSrc = currentChannel.embedUrl.replace('MUTE', isMuted ? '1' : '0')

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0]">LIVE NEWS</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse-glow" />
          <span className="text-[10px] font-bold text-[#ef4444]">LIVE</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 text-[#666] hover:text-[#ccc] transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <button
            onClick={onToggleExpand}
            className="p-1 text-[#666] hover:text-[#ccc] transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={onToggleExpand}
            className="p-1 text-[#666] hover:text-[#ccc] transition-colors md:hidden"
            title={isExpanded ? 'Scroll up' : 'Scroll down'}
          >
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Channel tabs */}
      <div className="flex items-center gap-0 px-2 py-1.5 border-b border-[#1e1e1e] overflow-x-auto scrollbar-thin shrink-0">
        {NEWS_CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider shrink-0 border transition-colors ${activeChannel === ch.id
                ? 'text-[#fff] border-current'
                : 'border-transparent text-[#666] hover:text-[#999]'
              }`}
            style={
              activeChannel === ch.id
                ? { backgroundColor: ch.color || '#1a1a1a', borderColor: ch.color || '#444', color: ch.color ? '#fff' : '#e0e0e0' }
                : {}
            }
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Video player */}
      <div className="flex-1 relative bg-[#000]" style={{ minHeight: isExpanded ? '400px' : '200px' }}>
        <iframe
          key={`${currentChannel.id}-${isMuted}`}
          src={embedSrc}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={currentChannel.label}
        />
      </div>
    </div>
  )
}
