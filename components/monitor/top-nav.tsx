'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Monitor,
  Search,
  Download,
  Link2,
  Settings,
  Maximize2,
  Minimize2,
  Globe,
  LayoutGrid,
  Volume2,
  X,
  Bell,
  Eye,
} from 'lucide-react'

interface TopNavProps {
  activeView: 'map' | 'news'
  onViewChange: (view: 'map' | 'news') => void
}

export default function TopNav({ activeView, onViewChange }: TopNavProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // Listen to keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowSettings(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Track fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const formatDate = (d: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return `${days[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // fullscreen not supported
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=geopolitical+${encodeURIComponent(searchQuery)}`, '_blank')
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className="flex items-center gap-2 bg-[#0d0d0d] border-b border-[#1a1a1a] px-3 py-1.5 text-xs h-10 shrink-0 relative z-50">
        {/* Left section */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewChange('map')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider border transition-colors ${
              activeView === 'map'
                ? 'bg-[#22c55e] text-[#000] border-[#22c55e]'
                : 'bg-[#1a1a1a] text-[#888] border-[#333] hover:text-[#ccc]'
            }`}
          >
            WORLD
          </button>
          <button
            onClick={() => onViewChange('news')}
            className={`p-1.5 rounded border transition-colors ${
              activeView === 'news'
                ? 'bg-[#1a1a1a] text-[#e0e0e0] border-[#444]'
                : 'bg-transparent text-[#666] border-[#222] hover:text-[#999]'
            }`}
            title="News Grid View"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => onViewChange('map')}
            className="p-1.5 rounded text-[#666] hover:text-[#999] border border-[#222] transition-colors"
            title="Globe View"
          >
            <Globe size={14} />
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-[#e0e0e0]" />
          <span className="text-[#e0e0e0] font-bold tracking-[0.2em] text-[11px]">MONITOR</span>
          <span className="text-[#555] text-[9px]">v2.5.23</span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse-glow" />
          <span className="text-[#22c55e] text-[10px] font-bold tracking-wider">LIVE</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date/time */}
        <span className="text-[#888] text-[10px] font-mono hidden md:block">{formatDate(currentTime)}</span>

        {/* DEFCON */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded px-2 py-0.5 hover:border-[#555] transition-colors"
          title="Toggle DEFCON alerts sound"
        >
          <Volume2 size={12} className={soundEnabled ? 'text-[#d97706]' : 'text-[#555]'} />
          <span className="text-[#ef4444] font-bold text-[10px]">DEFCON 3</span>
          <span className="text-[#888] text-[10px]">49%</span>
        </button>

        {/* Notification badge */}
        <button
          onClick={() => setNotificationsOn(!notificationsOn)}
          className={`relative p-1.5 rounded border transition-colors ${
            notificationsOn
              ? 'bg-[#dc2626]/20 text-[#ef4444] border-[#dc2626]/50'
              : 'bg-[#1a1a1a] text-[#666] border-[#333]'
          }`}
          title={notificationsOn ? 'Mute notifications' : 'Enable notifications'}
        >
          <Bell size={12} />
          {notificationsOn && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ef4444] rounded-full text-[7px] text-[#fff] font-bold flex items-center justify-center">
              12
            </span>
          )}
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-[#999] hover:text-[#e0e0e0] hover:border-[#555] text-[10px] transition-colors"
            title="Search (Ctrl+K)"
          >
            <Search size={12} />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden lg:inline text-[8px] px-1 py-0.5 bg-[#222] text-[#666] rounded ml-1">{'Ctrl+K'}</kbd>
          </button>
          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1 border rounded px-2 py-1 text-[10px] transition-colors ${
              copied
                ? 'bg-[#22c55e]/20 border-[#22c55e]/50 text-[#22c55e]'
                : 'bg-[#1a1a1a] border-[#333] text-[#999] hover:text-[#e0e0e0] hover:border-[#555]'
            }`}
            title="Copy link to clipboard"
          >
            <Link2 size={12} />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 transition-colors ${showSettings ? 'text-[#e0e0e0]' : 'text-[#666] hover:text-[#999]'}`}
            title="Settings"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-1 text-[#666] hover:text-[#999] transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Search overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[80px] bg-[#000]/70 backdrop-blur-sm" onClick={() => setShowSearch(false)}>
          <div className="bg-[#111] border border-[#333] rounded-lg w-full max-w-[520px] mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex items-center gap-2 p-3 border-b border-[#222]">
              <Search size={16} className="text-[#666] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search global news, events, regions..."
                className="flex-1 bg-transparent text-[13px] text-[#e0e0e0] placeholder-[#555] focus:outline-none font-mono"
              />
              <button type="button" onClick={() => setShowSearch(false)} className="p-1 text-[#666] hover:text-[#999]">
                <X size={14} />
              </button>
            </form>
            <div className="p-3 text-[10px] text-[#555]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-[#1a1a1a] rounded text-[#888]">Enter</kbd> to search</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-[#1a1a1a] rounded text-[#888]">Esc</kbd> to close</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings dropdown */}
      {showSettings && (
        <div className="absolute top-10 right-3 z-[9998] bg-[#111] border border-[#333] rounded-lg w-[240px] shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-[#222]">
            <span className="text-[10px] font-bold tracking-wider text-[#888]">SETTINGS</span>
          </div>
          <div className="p-2 flex flex-col gap-0.5">
            <label className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1a1a] cursor-pointer transition-colors">
              <span className="text-[11px] text-[#ccc] flex items-center gap-2">
                <Volume2 size={12} className="text-[#888]" />
                Sound alerts
              </span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#22c55e] bg-[#222]"
              />
            </label>
            <label className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1a1a] cursor-pointer transition-colors">
              <span className="text-[11px] text-[#ccc] flex items-center gap-2">
                <Bell size={12} className="text-[#888]" />
                Notifications
              </span>
              <input
                type="checkbox"
                checked={notificationsOn}
                onChange={(e) => setNotificationsOn(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#22c55e] bg-[#222]"
              />
            </label>
            <label className="flex items-center justify-between px-2 py-2 rounded hover:bg-[#1a1a1a] cursor-pointer transition-colors">
              <span className="text-[11px] text-[#ccc] flex items-center gap-2">
                <Eye size={12} className="text-[#888]" />
                Auto-refresh feeds
              </span>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#22c55e] bg-[#222]"
              />
            </label>
          </div>
          <div className="px-3 py-2 border-t border-[#222]">
            <div className="text-[9px] text-[#555]">MONITOR v2.5.23 | Data auto-updates every 2 min</div>
          </div>
        </div>
      )}
    </>
  )
}
