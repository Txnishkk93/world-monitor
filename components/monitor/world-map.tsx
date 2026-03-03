'use client'

import { useEffect, useState, useRef } from 'react'

interface ConflictZone {
  name: string
  lat: number
  lng: number
  severity: 'high' | 'elevated' | 'monitoring'
  type: 'conflict' | 'military' | 'nuclear' | 'base' | 'cyber'
  description: string
  casualties?: string
  updated?: string
}

interface CountryAlert {
  iso2: string
  severity: 'high' | 'elevated' | 'monitoring'
}

// Country-level fills — entire country polygon colored by severity
const COUNTRY_ALERTS: CountryAlert[] = [
  // HIGH
  { iso2: 'PS', severity: 'high' },
  { iso2: 'UA', severity: 'high' },
  { iso2: 'SD', severity: 'high' },
  { iso2: 'MM', severity: 'high' },
  { iso2: 'IR', severity: 'high' },
  { iso2: 'CD', severity: 'high' },
  { iso2: 'HT', severity: 'high' },
  { iso2: 'MX', severity: 'high' },
  { iso2: 'IL', severity: 'high' },
  // ELEVATED
  { iso2: 'YE', severity: 'elevated' },
  { iso2: 'SY', severity: 'elevated' },
  { iso2: 'SO', severity: 'elevated' },
  { iso2: 'ET', severity: 'elevated' },
  { iso2: 'NG', severity: 'elevated' },
  { iso2: 'PK', severity: 'elevated' },
  { iso2: 'CO', severity: 'elevated' },
  { iso2: 'ML', severity: 'elevated' },
  { iso2: 'BF', severity: 'elevated' },
  { iso2: 'IQ', severity: 'elevated' },
  { iso2: 'EC', severity: 'elevated' },
  { iso2: 'LB', severity: 'elevated' },
  { iso2: 'AF', severity: 'elevated' },
  { iso2: 'VE', severity: 'elevated' },
  { iso2: 'MZ', severity: 'elevated' },
  // MONITORING
  { iso2: 'TW', severity: 'monitoring' },
  { iso2: 'KP', severity: 'monitoring' },
  { iso2: 'LY', severity: 'monitoring' },
  { iso2: 'BR', severity: 'monitoring' },
  { iso2: 'NE', severity: 'monitoring' },
  { iso2: 'CF', severity: 'monitoring' },
  { iso2: 'SS', severity: 'monitoring' },
]

const COUNTRY_ALERT_MAP: Record<string, 'high' | 'elevated' | 'monitoring'> = {}
COUNTRY_ALERTS.forEach((a) => { COUNTRY_ALERT_MAP[a.iso2] = a.severity })

// Updated to reflect 2025-2026 conflict data from ACLED, CFR, and open sources
const CONFLICT_ZONES: ConflictZone[] = [
  // HIGH SEVERITY — Active combat / mass casualties
  { name: 'Gaza Strip', lat: 31.3547, lng: 34.3088, severity: 'high', type: 'conflict', description: 'Ongoing Israel–Hamas war; catastrophic humanitarian crisis', casualties: '21,000+ (2024-25)', updated: 'Mar 2026' },
  { name: 'Ukraine — Eastern Front', lat: 48.3794, lng: 31.1656, severity: 'high', type: 'conflict', description: 'Russia–Ukraine war; infrastructure strikes intensifying', casualties: '200,000–285,000 est.', updated: 'Mar 2026' },
  { name: 'Sudan — Khartoum / Darfur', lat: 15.5007, lng: 32.5599, severity: 'high', type: 'conflict', description: 'SAF vs RSF civil war; famine conditions, mass displacement', casualties: '20,000+ (2024-25)', updated: 'Mar 2026' },
  { name: 'Sudan — El Fasher', lat: 13.6287, lng: 25.3497, severity: 'high', type: 'conflict', description: 'RSF siege; genocide risk flagged by UN', casualties: 'Ongoing', updated: 'Mar 2026' },
  { name: 'Myanmar — Conflict Zones', lat: 19.7633, lng: 96.0785, severity: 'high', type: 'conflict', description: 'Junta vs resistance; 20,000+ casualties mid-2024 to mid-2025', casualties: '20,000+ (2024-25)', updated: 'Mar 2026' },
  { name: 'West Bank', lat: 31.9522, lng: 35.2332, severity: 'high', type: 'conflict', description: 'Escalating Israeli military operations; settler violence', casualties: 'Ongoing', updated: 'Mar 2026' },
  { name: 'Iran — Post-Strike Recovery', lat: 32.4279, lng: 53.688, severity: 'high', type: 'military', description: 'Post June-2025 US-Israeli strikes; rebuilding nuclear & military sites', updated: 'Mar 2026' },
  { name: 'DR Congo — Eastern Provinces', lat: -1.6596, lng: 29.2225, severity: 'high', type: 'conflict', description: 'M23, FDLR and armed militias; years of ongoing fighting', casualties: 'Decades-long', updated: 'Mar 2026' },
  { name: 'Haiti — Gang Violence', lat: 18.5944, lng: -72.3074, severity: 'high', type: 'conflict', description: 'Gang control of Port-au-Prince; state collapse; heavy civilian targeting', updated: 'Mar 2026' },
  { name: 'Mexico — Cartel Violence', lat: 23.6345, lng: -102.5528, severity: 'high', type: 'conflict', description: 'Cartel armed conflict; top 10 most severe globally (ACLED)', updated: 'Mar 2026' },
  // ELEVATED SEVERITY
  { name: 'Yemen — Houthi Activity', lat: 15.5527, lng: 48.5164, severity: 'elevated', type: 'conflict', description: 'Fragile ceasefire; Red Sea shipping still at risk', updated: 'Mar 2026' },
  { name: 'Syria — Post-Assad', lat: 33.5138, lng: 36.2765, severity: 'elevated', type: 'conflict', description: 'ISIS cells, sectarian tensions, Israeli airstrikes continuing', updated: 'Mar 2026' },
  { name: 'Somalia — Mogadishu', lat: 2.0469, lng: 45.3182, severity: 'elevated', type: 'conflict', description: 'Al-Shabaab insurgency; risk of US withdrawal of support', updated: 'Mar 2026' },
  { name: 'Ethiopia — Tigray / Amhara', lat: 13.4967, lng: 38.4955, severity: 'elevated', type: 'conflict', description: 'Fresh fighting 2025-2026 between federal forces and Tigray; ethnic militias active', updated: 'Mar 2026' },
  { name: 'Nigeria — Boko Haram / Banditry', lat: 10.4515, lng: 7.5402, severity: 'elevated', type: 'conflict', description: 'Complex regional conflicts; top-10 most severe globally', updated: 'Mar 2026' },
  { name: 'Pakistan — Northwest / Balochistan', lat: 31.5204, lng: 74.3587, severity: 'elevated', type: 'conflict', description: 'TTP and separatist insurgency escalating; worsening 2025', updated: 'Mar 2026' },
  { name: 'Colombia — ELN / FARC Dissidents', lat: 4.571, lng: -74.2973, severity: 'elevated', type: 'conflict', description: 'Guerrilla and cartel violence in rural corridors', updated: 'Mar 2026' },
  { name: 'Mali / Burkina Faso — Sahel', lat: 12.3641, lng: -1.5275, severity: 'elevated', type: 'conflict', description: 'Jihadist insurgency; worsening Sahel security', updated: 'Mar 2026' },
  { name: 'Iraq — Baghdad', lat: 33.3128, lng: 44.3615, severity: 'elevated', type: 'military', description: 'Iran-backed militia activity; US base attacks', updated: 'Mar 2026' },
  { name: 'Ecuador — Gang Violence', lat: -1.8312, lng: -78.1834, severity: 'elevated', type: 'conflict', description: 'Surged to #6 globally in ACLED 2025 index; gang warfare', updated: 'Mar 2026' },
  { name: 'Lebanon — Southern Border', lat: 33.0, lng: 35.5, severity: 'elevated', type: 'conflict', description: 'Post-ceasefire tensions; Israeli buffer zone; fragile stability', updated: 'Mar 2026' },
  { name: 'Afghanistan', lat: 33.9391, lng: 67.71, severity: 'elevated', type: 'conflict', description: 'ISIS-K bombings; Taliban-controlled territory; border clashes with Pakistan', updated: 'Mar 2026' },
  { name: 'Venezuela — US Pressure', lat: 6.4238, lng: -66.5897, severity: 'elevated', type: 'conflict', description: 'High-likelihood US military action risk; Tier I CFR 2026', updated: 'Mar 2026' },
  { name: 'Mozambique — Cabo Delgado', lat: -12.3333, lng: 39.9167, severity: 'elevated', type: 'conflict', description: 'Islamist militant attacks in northern province', updated: 'Mar 2026' },
  { name: 'Red Sea Corridor', lat: 12.8628, lng: 43.1425, severity: 'elevated', type: 'military', description: 'Houthi-linked threat to shipping; fragile stabilization', updated: 'Mar 2026' },
  { name: 'India-Pakistan Kashmir', lat: 34.0837, lng: 74.7973, severity: 'elevated', type: 'conflict', description: 'May 2025 four-day armed exchange following terror attack; nuclear risk', casualties: '26 civilians killed Apr 2025', updated: 'Mar 2026' },
  // MONITORING — Heightened tension / flashpoints
  { name: 'Taiwan Strait', lat: 24.2535, lng: 120.541, severity: 'monitoring', type: 'military', description: 'Taiwan Strait crisis rated ~50% likely in 2026 (CFR)', updated: 'Mar 2026' },
  { name: 'Korean Peninsula', lat: 37.9575, lng: 126.8544, severity: 'monitoring', type: 'military', description: 'North Korea elevated to Tier I risk (CFR 2026)', updated: 'Mar 2026' },
  { name: 'South China Sea', lat: 14.5995, lng: 113.8247, severity: 'monitoring', type: 'military', description: 'Maritime territorial disputes; maritime incidents', updated: 'Mar 2026' },
  { name: 'Strait of Hormuz', lat: 26.5667, lng: 56.25, severity: 'monitoring', type: 'military', description: 'Critical oil chokepoint; Iran tensions', updated: 'Mar 2026' },
  { name: 'Libya — Tripoli', lat: 32.8872, lng: 13.1913, severity: 'monitoring', type: 'conflict', description: 'Persistent political fragmentation', updated: 'Mar 2026' },
  { name: 'NATO Eastern Flank', lat: 54.6872, lng: 25.2797, severity: 'monitoring', type: 'base', description: 'Russian drone incursions into NATO airspace 2025', updated: 'Mar 2026' },
  { name: 'Brazil — Gang Violence', lat: -10.3333, lng: -53.2, severity: 'monitoring', type: 'conflict', description: 'Gang-related violence; ranks in global top 10 (ACLED)', updated: 'Mar 2026' },
  { name: 'Ukraine — Western Infrastructure', lat: 50.45, lng: 30.5241, severity: 'monitoring', type: 'military', description: 'Russian strikes on Kyiv and western cities intensifying', updated: 'Mar 2026' },
]

const LAYERS = [
  { id: 'conflicts', label: 'CONFLICT ZONES', active: true },
  { id: 'military', label: 'MILITARY / BASES', active: true },
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

function getSeverityFillOpacity(severity: string) {
  switch (severity) {
    case 'high': return 0.45
    case 'elevated': return 0.30
    case 'monitoring': return 0.20
    default: return 0
  }
}

export default function WorldMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [selectedRange, setSelectedRange] = useState('7d')
  const [ready, setReady] = useState(false)
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    conflicts: true,
    military: true,
    nuclear: false,
    intel: true,
  })
  const [stats, setStats] = useState({ high: 0, elevated: 0, monitoring: 0 })

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Load Leaflet + GeoJSON country fills on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('pulse-css')) {
      const style = document.createElement('style')
      style.id = 'pulse-css'
      style.textContent = `
        @keyframes country-pulse-high {
          0%   { fill-opacity: 0.50; }
          50%  { fill-opacity: 0.12; }
          100% { fill-opacity: 0.50; }
        }
        @keyframes country-pulse-elevated {
          0%   { fill-opacity: 0.32; }
          50%  { fill-opacity: 0.10; }
          100% { fill-opacity: 0.32; }
        }
        @keyframes leaflet-pulse-high {
          0%   { stroke-opacity: 0.9; stroke-width: 3; r: 16; }
          50%  { stroke-opacity: 0.3; stroke-width: 8; r: 28; }
          100% { stroke-opacity: 0.9; stroke-width: 3; r: 16; }
        }
        @keyframes leaflet-pulse-elevated {
          0%   { stroke-opacity: 0.8; stroke-width: 2; r: 12; }
          50%  { stroke-opacity: 0.2; stroke-width: 6; r: 20; }
          100% { stroke-opacity: 0.8; stroke-width: 2; r: 12; }
        }
        .country-fill-high path       { animation: country-pulse-high     1.8s ease-in-out infinite; }
        .country-fill-elevated path   { animation: country-pulse-elevated  2.6s ease-in-out infinite; }
        .pulse-high circle.leaflet-interactive     { animation: leaflet-pulse-high     1.4s ease-in-out infinite; }
        .pulse-elevated circle.leaflet-interactive { animation: leaflet-pulse-elevated 2.0s ease-in-out infinite; }
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
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip { background: #111 !important; border: 1px solid #333 !important; }
        .leaflet-control-zoom a {
          background: #111 !important; color: #888 !important; border-color: #262626 !important;
        }
        .leaflet-control-zoom a:hover { background: #1a1a1a !important; color: #ccc !important; }
      `
      document.head.appendChild(style)
    }

    import('leaflet').then(async (L) => {
      if (!mapContainerRef.current) return

      // Destroy any stale Leaflet instance on this container (Strict Mode double-invoke)
      const container = mapContainerRef.current as HTMLElement & { _leaflet_id?: number }
      if (container._leaflet_id) {
        container._leaflet_id = undefined
      }

      if (mapRef.current) return

      const map = L.default.map(mapContainerRef.current, {
        center: [20, 20],
        zoom: 2,
        minZoom: 2,
        maxZoom: 12,
        zoomControl: false,
        attributionControl: false,
      })

      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
      }).addTo(map)

      L.default.control.zoom({ position: 'topright' }).addTo(map)

      // ── Load GeoJSON country polygons ──────────────────────────────────
      try {
        const geoResp = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
        const geoData = await geoResp.json()

        L.default.geoJSON(geoData, {
          style: (feature) => {
            const iso = feature?.properties?.ISO_A2 as string | undefined
            const severity = iso ? COUNTRY_ALERT_MAP[iso] : undefined
            if (!severity) {
              return { fillColor: 'transparent', fillOpacity: 0, color: '#1a1a1a', weight: 0.3, opacity: 0.4 }
            }
            const color = getSeverityColor(severity)
            const fillOpacity = getSeverityFillOpacity(severity)
            return {
              fillColor: color,
              fillOpacity,
              color,
              weight: severity === 'high' ? 1.2 : 0.8,
              opacity: 0.7,
              className: severity === 'high' ? 'country-fill-high' : severity === 'elevated' ? 'country-fill-elevated' : '',
            }
          },
          onEachFeature: (feature, layer) => {
            const iso = feature?.properties?.ISO_A2 as string | undefined
            const severity = iso ? COUNTRY_ALERT_MAP[iso] : undefined
            if (!severity) return
            const color = getSeverityColor(severity)
            const fillOpacity = getSeverityFillOpacity(severity)
            layer.on('mouseover', () => {
              ; (layer as import('leaflet').Path).setStyle({ fillOpacity: fillOpacity + 0.25, weight: 2 })
            })
            layer.on('mouseout', () => {
              ; (layer as import('leaflet').Path).setStyle({ fillOpacity, weight: severity === 'high' ? 1.2 : 0.8 })
            })
            // Pass through click to map (don't block marker popups)
            void color
          },
        }).addTo(map)
      } catch (err) {
        console.warn('GeoJSON load failed', err)
      }

      mapRef.current = { map, L: L.default }
      setReady(true)
    })

    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
      if (mapRef.current) {
        const { map } = mapRef.current as { map: { remove: () => void } }
        map.remove()
        mapRef.current = null
      }
    }
  }, [])

  // ── Update pulsing circle markers when layers change ───────────────────
  useEffect(() => {
    if (!ready || !mapRef.current) return

    const { map, L } = mapRef.current as {
      map: import('leaflet').Map
      L: typeof import('leaflet').default
    }

    map.eachLayer((layer: unknown) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Circle) {
        map.removeLayer(layer)
      }
    })

    let highCount = 0, elevatedCount = 0, monitoringCount = 0

    CONFLICT_ZONES.forEach((zone) => {
      const show =
        (zone.type === 'conflict' && activeLayers.conflicts) ||
        (zone.type === 'military' && activeLayers.military) ||
        (zone.type === 'nuclear' && activeLayers.nuclear) ||
        (zone.type === 'base' && activeLayers.military) ||
        (zone.type === 'cyber' && activeLayers.intel)

      if (!show) return

      if (zone.severity === 'high') highCount++
      else if (zone.severity === 'elevated') elevatedCount++
      else monitoringCount++

      const color = getSeverityColor(zone.severity)
      const isHigh = zone.severity === 'high'
      const isElevated = zone.severity === 'elevated'
      const pulseRadius = isHigh ? 18 : isElevated ? 12 : 7
      const coreRadius = isHigh ? 8 : isElevated ? 6 : 4

      // Outer glow ring
      if (isHigh || isElevated) {
        L.circle([zone.lat, zone.lng], {
          radius: isHigh ? 220000 : 140000,
          color: color,
          fillColor: color,
          fillOpacity: isHigh ? 0.08 : 0.05,
          weight: 0,
          interactive: false,
        } as import('leaflet').CircleOptions).addTo(map)
      }

      // Animated pulse ring
      L.circleMarker([zone.lat, zone.lng], {
        radius: pulseRadius,
        color: color,
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: isHigh ? 3 : 2,
        opacity: isHigh ? 0.85 : 0.6,
        className: isHigh ? 'pulse-high' : isElevated ? 'pulse-elevated' : '',
        interactive: false,
      } as import('leaflet').CircleMarkerOptions).addTo(map)

      // Core dot with popup
      const popupContent = `
        <div style="background:#0d0d0d;color:#e0e0e0;padding:10px 12px;border-radius:4px;font-family:monospace;font-size:11px;min-width:200px;border:1px solid ${color}44;box-shadow:0 0 20px ${color}22;">
          <div style="font-weight:700;margin-bottom:5px;color:${color};font-size:12px;">${zone.name}</div>
          <div style="color:#aaa;font-size:10px;margin-bottom:6px;line-height:1.5">${zone.description}</div>
          ${zone.casualties ? `<div style="color:#888;font-size:9px;margin-bottom:4px">⚠ Casualties: ${zone.casualties}</div>` : ''}
          <div style="display:flex;gap:6px;align-items:center;margin-top:4px">
            <span style="background:${color};color:#000;padding:2px 7px;border-radius:2px;font-size:9px;font-weight:800">${zone.severity.toUpperCase()}</span>
            <span style="color:#555;font-size:9px">${zone.type.toUpperCase()}</span>
            ${zone.updated ? `<span style="color:#444;font-size:9px;margin-left:auto">↻ ${zone.updated}</span>` : ''}
          </div>
        </div>`

      L.circleMarker([zone.lat, zone.lng], {
        radius: coreRadius,
        color: color,
        fillColor: color,
        fillOpacity: isHigh ? 1 : 0.85,
        weight: isHigh ? 2 : 1,
      })
        .bindPopup(popupContent, { className: 'dark-popup', maxWidth: 280 })
        .addTo(map)
    })

    setStats({ high: highCount, elevated: elevatedCount, monitoring: monitoringCount })
  }, [activeLayers, ready])

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" style={{ background: '#0a0a0a' }} />

      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-[10px] text-[#555] tracking-widest animate-pulse">LOADING THREAT MAP...</div>
        </div>
      )}

      {/* Top header bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-3 py-2 bg-[#080808]/95 border-b border-[#1a1a1a] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="text-[10px] text-[#ef4444] font-bold tracking-[0.2em]">LIVE CONFLICT MONITOR</span>
          <span className="text-[9px] text-[#444] ml-2">2025–2026 DATA</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[#ef4444] font-bold">{stats.high}</span>
            <span className="text-[9px] text-[#444]">HIGH</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[#f59e0b] font-bold">{stats.elevated}</span>
            <span className="text-[9px] text-[#444]">ELEVATED</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-[#3b82f6] font-bold">{stats.monitoring}</span>
            <span className="text-[9px] text-[#444]">MONITORING</span>
          </div>
          <span className="text-[9px] text-[#333]">|</span>
          <span className="text-[9px] text-[#444]">SRC: ACLED / CFR / IISS</span>
        </div>
      </div>

      {/* Controls overlay - top left (below header) */}
      <div className="absolute top-12 left-3 z-[1000] flex flex-col gap-2">
        {/* Time range */}
        <div className="flex items-center gap-1 bg-[#111]/90 border border-[#262626] rounded p-1 backdrop-blur-sm">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${selectedRange === range
                  ? 'bg-[#ef4444] text-[#000]'
                  : 'text-[#888] hover:text-[#ccc]'
                }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Layers */}
        <div className="bg-[#111]/90 border border-[#262626] rounded p-2 backdrop-blur-sm min-w-[190px]">
          <div className="text-[9px] text-[#666] font-bold tracking-widest mb-2">LAYERS</div>
          {LAYERS.map((layer) => (
            <label
              key={layer.id}
              className="flex items-center gap-2 py-1 cursor-pointer hover:bg-[#1a1a1a] px-1 rounded"
            >
              <input
                type="checkbox"
                checked={activeLayers[layer.id]}
                onChange={() => toggleLayer(layer.id)}
                className="w-3 h-3 rounded accent-[#ef4444] bg-[#222] border-[#444]"
              />
              <span className="text-[10px] text-[#ccc] tracking-wider font-medium">{layer.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-4 bg-[#111]/95 border border-[#222] rounded px-4 py-2 backdrop-blur-sm">
        <span className="text-[9px] text-[#555] font-bold tracking-widest">LEGEND</span>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-3 rounded-sm bg-[#ef4444] opacity-60 shadow-[0_0_6px_#ef444488]" />
          <span className="text-[9px] text-[#999]">High Alert</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-3 rounded-sm bg-[#f59e0b] opacity-50" />
          <span className="text-[9px] text-[#999]">Elevated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-3 rounded-sm bg-[#3b82f6] opacity-35" />
          <span className="text-[9px] text-[#999]">Monitoring</span>
        </div>
        <div className="w-px h-3 bg-[#333]" />
        <span className="text-[9px] text-[#444]">Click marker for details</span>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-3 right-3 z-[1000] text-[8px] text-[#444] bg-[#111]/80 px-2 py-1 rounded">
        CARTO &copy; OpenStreetMap
      </div>
    </div>
  )
}