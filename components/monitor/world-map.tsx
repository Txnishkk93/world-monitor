'use client'

import { useEffect, useState, useRef } from 'react'

interface ConflictZone {
  name: string
  lat: number
  lng: number
  severity: 'high' | 'elevated' | 'monitoring'
  type: 'conflict' | 'military' | 'nuclear' | 'base' | 'cyber'
  description: string
}

const CONFLICT_ZONES: ConflictZone[] = [
  { name: 'Iran - Active Strikes', lat: 32.4279, lng: 53.688, severity: 'high', type: 'conflict', description: 'Active military operations' },
  { name: 'Israel - Defense Operations', lat: 31.0461, lng: 34.8516, severity: 'high', type: 'conflict', description: 'Active defense operations' },
  { name: 'Lebanon - Border Tensions', lat: 33.8547, lng: 35.8623, severity: 'elevated', type: 'conflict', description: 'Cross-border military activity' },
  { name: 'Ukraine - Eastern Front', lat: 48.3794, lng: 31.1656, severity: 'high', type: 'conflict', description: 'Ongoing conflict in eastern regions' },
  { name: 'Syria - Damascus', lat: 33.5138, lng: 36.2765, severity: 'elevated', type: 'military', description: 'Military operations' },
  { name: 'Yemen - Houthi Activity', lat: 15.5527, lng: 48.5164, severity: 'elevated', type: 'conflict', description: 'Red Sea shipping disruptions' },
  { name: 'Taiwan Strait', lat: 24.2535, lng: 120.541, severity: 'monitoring', type: 'military', description: 'Increased military presence' },
  { name: 'Korean DMZ', lat: 37.9575, lng: 126.8544, severity: 'monitoring', type: 'military', description: 'Standing military tensions' },
  { name: 'South China Sea', lat: 14.5995, lng: 113.8247, severity: 'monitoring', type: 'military', description: 'Maritime territorial disputes' },
  { name: 'Sudan - Khartoum', lat: 15.5007, lng: 32.5599, severity: 'high', type: 'conflict', description: 'Civil conflict' },
  { name: 'Myanmar - Internal', lat: 19.7633, lng: 96.0785, severity: 'elevated', type: 'conflict', description: 'Internal armed conflict' },
  { name: 'Iraq - Baghdad', lat: 33.3128, lng: 44.3615, severity: 'elevated', type: 'military', description: 'Coalition activity' },
  { name: 'Libya - Tripoli', lat: 32.8872, lng: 13.1913, severity: 'monitoring', type: 'conflict', description: 'Political instability' },
  { name: 'Somalia - Mogadishu', lat: 2.0469, lng: 45.3182, severity: 'elevated', type: 'conflict', description: 'Al-Shabaab insurgency' },
  { name: 'Pakistan - Northwest', lat: 34.0151, lng: 71.5249, severity: 'monitoring', type: 'military', description: 'Border security operations' },
  { name: 'Mali - Sahel', lat: 17.5707, lng: -3.9962, severity: 'elevated', type: 'conflict', description: 'Sahel insurgency' },
  { name: 'Red Sea Corridor', lat: 12.8628, lng: 43.1425, severity: 'high', type: 'military', description: 'Shipping route under threat' },
  { name: 'NATO HQ Brussels', lat: 50.8781, lng: 4.4201, severity: 'monitoring', type: 'base', description: 'NATO headquarters' },
  { name: 'Strait of Hormuz', lat: 26.5667, lng: 56.25, severity: 'elevated', type: 'military', description: 'Critical shipping chokepoint' },
  { name: 'Niger - Coup Effects', lat: 13.5116, lng: 2.1254, severity: 'monitoring', type: 'conflict', description: 'Post-coup instability' },
]

const LAYERS = [
  { id: 'conflicts', label: 'CONFLICT ZONES', active: true },
  { id: 'military', label: 'MILITARY BASES', active: true },
  { id: 'nuclear', label: 'NUCLEAR SITES', active: false },
  { id: 'intel', label: 'INTEL HOTSPOTS', active: true },
]

const TIME_RANGES = ['1h', '6h', '24h', '48h', '7d', 'All']

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high': return '#ef4444'
    case 'elevated': return '#f59e0b'
    case 'monitoring': return '#3b82f6'
    default: return '#666'
  }
}

export default function WorldMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const [selectedRange, setSelectedRange] = useState('7d')
  const [ready, setReady] = useState(false)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    conflicts: true,
    military: true,
    nuclear: false,
    intel: true,
  })

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!mapContainerRef.current || mapRef.current) return

      const map = L.default.map(mapContainerRef.current, {
        center: [30, 45],
        zoom: 3,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: false,
        attributionControl: false,
      })

      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
      }).addTo(map)

      L.default.control.zoom({ position: 'topright' }).addTo(map)

      mapRef.current = { map, L: L.default }
      setReady(true)
    })

    return () => {
      if (mapRef.current) {
        const { map } = mapRef.current as { map: { remove: () => void } }
        map.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when layers change
  useEffect(() => {
    if (!ready || !mapRef.current) return

    const { map, L } = mapRef.current as {
      map: {
        eachLayer: (fn: (layer: unknown) => void) => void
        removeLayer: (layer: unknown) => void
      }
      L: typeof import('leaflet').default
    }

    // Remove existing markers
    map.eachLayer((layer: unknown) => {
      if (
        layer instanceof L.CircleMarker ||
        layer instanceof L.Circle
      ) {
        map.removeLayer(layer)
      }
    })

    CONFLICT_ZONES.forEach((zone) => {
      const show =
        (zone.type === 'conflict' && activeLayers.conflicts) ||
        (zone.type === 'military' && activeLayers.military) ||
        (zone.type === 'nuclear' && activeLayers.nuclear) ||
        (zone.type === 'base' && activeLayers.military) ||
        (zone.type === 'cyber' && activeLayers.intel)

      if (!show) return

      const color = getSeverityColor(zone.severity)
      const radius = zone.severity === 'high' ? 12 : zone.severity === 'elevated' ? 9 : 6

      // Outer glow
      L.circle([zone.lat, zone.lng], {
        radius: radius * 15000,
        color: color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 0,
      }).addTo(map as unknown as import('leaflet').Map)

      // Main marker
      L.circleMarker([zone.lat, zone.lng], {
        radius: radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 2,
      })
        .bindPopup(
          `<div style="background:#111;color:#e0e0e0;padding:8px;border-radius:4px;font-family:monospace;font-size:11px;min-width:180px;border:1px solid #333;">
            <div style="font-weight:700;margin-bottom:4px;color:${color}">${zone.name}</div>
            <div style="color:#888;font-size:10px;margin-bottom:4px">${zone.description}</div>
            <div style="display:flex;gap:6px;align-items:center">
              <span style="background:${color};color:#fff;padding:1px 6px;border-radius:2px;font-size:9px;font-weight:700">${zone.severity.toUpperCase()}</span>
              <span style="color:#666;font-size:9px">${zone.type.toUpperCase()}</span>
            </div>
          </div>`,
          { className: 'dark-popup' }
        )
        .addTo(map as unknown as import('leaflet').Map)
    })
  }, [activeLayers, ready])

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" style={{ background: '#0a0a0a' }} />

      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-[10px] text-[#555] tracking-wider animate-pulse">LOADING MAP...</div>
        </div>
      )}

      {/* Controls overlay - top left */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
        {/* Time range */}
        <div className="flex items-center gap-1 bg-[#111]/90 border border-[#262626] rounded p-1 backdrop-blur-sm">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${
                selectedRange === range
                  ? 'bg-[#22c55e] text-[#000]'
                  : 'text-[#888] hover:text-[#ccc]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Layers */}
        <div className="bg-[#111]/90 border border-[#262626] rounded p-2 backdrop-blur-sm min-w-[180px]">
          <div className="text-[9px] text-[#888] font-bold tracking-wider mb-2">LAYERS</div>
          {LAYERS.map((layer) => (
            <label
              key={layer.id}
              className="flex items-center gap-2 py-1 cursor-pointer hover:bg-[#1a1a1a] px-1 rounded"
            >
              <input
                type="checkbox"
                checked={activeLayers[layer.id]}
                onChange={() => toggleLayer(layer.id)}
                className="w-3 h-3 rounded accent-[#22c55e] bg-[#222] border-[#444]"
              />
              <span className="text-[10px] text-[#ccc] tracking-wider font-medium">{layer.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-4 bg-[#111]/90 border border-[#262626] rounded px-3 py-1.5 backdrop-blur-sm">
        <span className="text-[9px] text-[#666] font-bold tracking-wider">LEGEND</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          <span className="text-[9px] text-[#999]">High Alert</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
          <span className="text-[9px] text-[#999]">Elevated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
          <span className="text-[9px] text-[#999]">Monitoring</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[7px] border-l-transparent border-r-transparent border-b-[#3b82f6]" />
          <span className="text-[9px] text-[#999]">Base</span>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-3 right-3 z-[1000] text-[8px] text-[#555] bg-[#111]/80 px-2 py-1 rounded">
        CARTO &copy; OpenStreetMap
      </div>

      <style jsx global>{`
        .leaflet-container {
          background: #0a0a0a !important;
          font-family: 'IBM Plex Mono', monospace !important;
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          background: #111 !important;
          border: 1px solid #333 !important;
        }
        .leaflet-control-zoom a {
          background: #111 !important;
          color: #888 !important;
          border-color: #262626 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1a1a1a !important;
          color: #ccc !important;
        }
      `}</style>
    </div>
  )
}
