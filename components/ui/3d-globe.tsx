'use client'

import { useEffect, useState, useMemo } from 'react'
import { Globe3D, GlobeMarker } from '@/components/ui/3d-globe'

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

// ─────────────────────────────────────────────────────────────────────────────
// REAL-WORLD CONFLICT DATA
// Sources: ACLED Conflict Index 2025, CFR Preventive Priorities 2026,
//          IISS, Britannica, Wikipedia — verified March 15 2026
// Total confirmed deaths 2025: 240,000+ (ACLED Dec 2024 – Nov 2025)
// ─────────────────────────────────────────────────────────────────────────────

const CONFLICT_ZONES: ConflictZone[] = [

  // ── HIGH SEVERITY — Active war / mass casualties ──────────────────────────

  {
    name: 'Iran — Op. Epic Fury (Tehran)',
    lat: 35.6892, lng: 51.389,
    severity: 'high', type: 'military',
    description: 'US-Israeli Operation Epic Fury launched Feb 28 2026. ~900 strikes in first 12 hrs. Supreme Leader Khamenei killed in opening salvo. Iran retaliating across 9 countries with 400+ missiles and drones.',
    casualties: '2,000+ killed; 6,668+ civilian units struck (Iranian Red Crescent, Mar 7 2026)',
    updated: 'Mar 2026',
  },
  {
    name: 'Iran — Strait of Hormuz',
    lat: 26.5667, lng: 56.25,
    severity: 'high', type: 'military',
    description: 'Iran blockading Strait of Hormuz. 150 freight ships stalled. IRGC attacking oil tankers; 2 struck off Oman. US Navy 5th Fleet engaged. Global energy at critical risk.',
    casualties: 'Multiple tanker crews killed/injured',
    updated: 'Mar 2026',
  },
  {
    name: 'Iran — Nuclear Sites (Parchin/Isfahan)',
    lat: 32.5, lng: 51.7,
    severity: 'high', type: 'nuclear',
    description: 'US struck Iran Atomic Energy Agency HQ, Parchin explosive research facility, and Isfahan nuclear complex. Bushehr reactor staff (100 Russians) evacuated. Radiological risk flagged by CSIS.',
    updated: 'Mar 2026',
  },
  {
    name: 'Gaza Strip',
    lat: 31.3547, lng: 34.3088,
    severity: 'high', type: 'conflict',
    description: 'Ongoing Israel-Hamas war. Most geographically diffuse conflict globally — violence recorded across 70% of Gaza/West Bank (ACLED). UN: catastrophic humanitarian situation. No meaningful ceasefire.',
    casualties: '21,417 killed Aug 2024–Aug 2025 (ACLED)',
    updated: 'Mar 2026',
  },
  {
    name: 'West Bank — IDF Operations',
    lat: 31.9522, lng: 35.2332,
    severity: 'high', type: 'conflict',
    description: 'Escalating IDF operations in Jenin, Tulkarm, Nablus refugee camps. Record settler violence. Post-Epic Fury spillover from Lebanon/Iran front increasing pressure.',
    updated: 'Mar 2026',
  },
  {
    name: 'Lebanon — 2026 War',
    lat: 33.8938, lng: 35.5018,
    severity: 'high', type: 'conflict',
    description: 'Hezbollah resumed full missile and drone attacks on Israeli military sites Feb 28 2026. Israel greatly expanded Beirut bombing in response. Britain\'s Akrotiri base in Cyprus struck by Iranian drone.',
    casualties: '12+ Israelis killed; Lebanese toll rising',
    updated: 'Mar 2026',
  },
  {
    name: 'Ukraine — Eastern Front',
    lat: 48.3794, lng: 31.1656,
    severity: 'high', type: 'conflict',
    description: 'Russia-Ukraine war. Russia controls ~20% of internationally recognised Ukraine. Ukraine and Gaza together drove 40%+ of all global conflict events in 2025 (ACLED). Air/drone strikes at all-time high.',
    casualties: '350,000+ direct deaths since 2022; ~1M total casualties (Statista)',
    updated: 'Mar 2026',
  },
  {
    name: 'Ukraine — Kyiv',
    lat: 50.45, lng: 30.5241,
    severity: 'high', type: 'military',
    description: 'Russian strikes on Kyiv and western cities intensifying 2026. Power grid and civilian infrastructure systematically targeted. Global air/drone strikes reached unprecedented peak in 2025 (ACLED).',
    updated: 'Mar 2026',
  },
  {
    name: 'Sudan — Khartoum / Darfur',
    lat: 15.5007, lng: 32.5599,
    severity: 'high', type: 'conflict',
    description: 'SAF vs RSF civil war in 3rd year. ACLED documented 198 drone strikes in Jan-Feb 2026 alone — 52 with civilian casualties killing 478. 12M+ displaced. Famine declared. One of world\'s deadliest ongoing conflicts.',
    casualties: '20,373 killed Aug 2024–Aug 2025; 478 more Jan–Feb 2026 (ACLED)',
    updated: 'Mar 2026',
  },
  {
    name: 'Sudan — El Fasher (Darfur)',
    lat: 13.6287, lng: 25.3497,
    severity: 'high', type: 'conflict',
    description: 'RSF siege of last SAF-held city in Darfur. UN genocide risk flagged. Mass killings and systematic sexual violence documented. Hospitals and aid convoys deliberately attacked.',
    casualties: 'Genocide risk (UN)',
    updated: 'Mar 2026',
  },
  {
    name: 'Myanmar — Civil War',
    lat: 19.7633, lng: 96.0785,
    severity: 'high', type: 'conflict',
    description: 'World\'s most fragmented conflict: 1,200+ distinct armed groups (ACLED). Junta vs broad resistance. World\'s longest ongoing civil war (since 1948). ACLED "Extreme" severity. Ethnic cleansing in Rakhine state.',
    casualties: '15,000+ killed mid-2024 to mid-2025 (ACLED)',
    updated: 'Mar 2026',
  },
  {
    name: 'DR Congo — Goma / East DRC',
    lat: -1.6596, lng: 29.2225,
    severity: 'high', type: 'conflict',
    description: 'Rwanda-backed M23 controls Goma since Jan 2025. ACLED: ongoing military offensive to recapture. Drone attack on Goma under investigation Mar 2026. FDLR and 100+ armed groups active. ACLED top-10 deadliest.',
    casualties: 'Decades-long; tens of thousands annually',
    updated: 'Mar 2026',
  },
  {
    name: 'Haiti — Gang Violence',
    lat: 18.5944, lng: -72.3074,
    severity: 'high', type: 'conflict',
    description: 'Gangs control Port-au-Prince. ACLED: 4,500+ Haitians killed from political violence in 2025. Ranked top-10 globally for deadliness AND danger to civilians. State near total collapse.',
    casualties: '4,500+ killed 2025 (ACLED)',
    updated: 'Mar 2026',
  },
  {
    name: 'Mexico — Cartel War',
    lat: 23.6345, lng: -102.5528,
    severity: 'high', type: 'conflict',
    description: 'ACLED "Extreme" severity. Ranked top-10 globally in both deadliness and danger to civilians. CJNG vs Sinaloa Cartel full territorial war. US Operation Epic Fury diverts regional security attention.',
    updated: 'Mar 2026',
  },

  // ── ELEVATED SEVERITY ─────────────────────────────────────────────────────

  {
    name: 'Venezuela — Post-Intervention',
    lat: 10.4806, lng: -66.9036,
    severity: 'elevated', type: 'military',
    description: 'US Delta Force "Operation Absolute Resolve" (Jan 3 2026): 150+ aircraft captured Maduro. VP Rodríguez acting president. Political vacuum; Trump threatens second larger military operation. Post-Maduro transition unclear.',
    casualties: 'Several US injured; Venezuelan defenders killed',
    updated: 'Mar 2026',
  },
  {
    name: 'UAE — Dubai / Jebel Ali',
    lat: 25.2048, lng: 55.2708,
    severity: 'elevated', type: 'military',
    description: 'Iran launched 167 missiles at UAE (40% of Epic Fury retaliation). Dubai Airport struck (4 injured). Burj Al Arab drone debris fire. Jebel Ali port fire. UAE signaled willingness for direct military response.',
    updated: 'Mar 2026',
  },
  {
    name: 'Bahrain — 5th Fleet HQ',
    lat: 26.0667, lng: 50.5577,
    severity: 'elevated', type: 'base',
    description: 'US Navy 5th Fleet HQ in Manama targeted by Iranian Shahed-136 drone. Crowne Plaza hotel struck with civilian casualties. 3 US servicemembers KIA, 5 seriously wounded (confirmed CENTCOM Mar 1 2026).',
    casualties: '3 US KIA; 5 seriously wounded (CENTCOM)',
    updated: 'Mar 2026',
  },
  {
    name: 'Qatar — Al Udeid Air Base',
    lat: 25.1167, lng: 51.3167,
    severity: 'elevated', type: 'base',
    description: 'Iran launched 46 missiles at Al Udeid — largest US air base in Middle East. Ballistic missiles intercepted by Patriot systems. Qatar scrambled all available defenses.',
    updated: 'Mar 2026',
  },
  {
    name: 'Saudi Arabia — Prince Sultan Base',
    lat: 23.9716, lng: 45.4386,
    severity: 'elevated', type: 'base',
    description: 'Iranian missiles targeting Prince Sultan Airbase (hosts US troops) intercepted. Saudi Arabia vowed military response, Crown Prince invoking right of self-defense.',
    updated: 'Mar 2026',
  },
  {
    name: 'Iraq — Militia Attacks / Grid Collapse',
    lat: 33.3128, lng: 44.3615,
    severity: 'elevated', type: 'military',
    description: 'US and Israeli strikes on Iran-backed Iraqi militias Feb 28–Mar 1. Victory Base Complex near Baghdad Airport hit by FPV suicide drone. Iraq national power grid collapsed. Erbil explosion near US/coalition facilities.',
    updated: 'Mar 2026',
  },
  {
    name: 'Yemen — Houthi Resurgence',
    lat: 15.5527, lng: 48.5164,
    severity: 'elevated', type: 'conflict',
    description: 'Houthis (Iran-backed) resumed Red Sea shipping attacks in coordination with Epic Fury. 2025 ceasefire broken. US carrier group conducting counterstrike operations.',
    updated: 'Mar 2026',
  },
  {
    name: 'Syria — Post-Assad',
    lat: 33.5138, lng: 36.2765,
    severity: 'elevated', type: 'conflict',
    description: 'ISIS cells resurging. Israeli airstrikes continuing on Hezbollah/IRGC sites. ACLED "Extreme" severity. Sectarian violence, Turkish operations in north unresolved. Mexico leads danger ranking alongside Syria.',
    updated: 'Mar 2026',
  },
  {
    name: 'Pakistan — Northwest / Balochistan',
    lat: 31.5204, lng: 74.3587,
    severity: 'elevated', type: 'conflict',
    description: 'ACLED: Pakistan became "more dangerous for civilians" in 2025. TTP and separatist insurgency escalating. May 2025 India-Pakistan military exchange raised nuclear risk. Worsening security environment.',
    casualties: '26 civilians killed in Apr 2025 Pahalgam attack',
    updated: 'Mar 2026',
  },
  {
    name: 'India–Pakistan — Kashmir LoC',
    lat: 34.0837, lng: 74.7973,
    severity: 'elevated', type: 'military',
    description: 'May 2025: first direct India-Pakistan military exchange in decades following Pahalgam terror attack. Four-day armed exchange; nuclear-armed standoff. LOC and border remain tense.',
    casualties: '26 civilians killed (Pahalgam, Apr 2025)',
    updated: 'Mar 2026',
  },
  {
    name: 'Nigeria — Boko Haram / ISWAP',
    lat: 10.4515, lng: 7.5402,
    severity: 'elevated', type: 'conflict',
    description: 'ACLED top-10 deadliest conflict globally. Complex patchwork: Boko Haram, ISWAP, herder-farmer violence and organised banditry. North-East and North-West both active. No respite in 2025 (ACLED).',
    updated: 'Mar 2026',
  },
  {
    name: 'Ethiopia — Tigray / Amhara',
    lat: 13.4967, lng: 38.4955,
    severity: 'elevated', type: 'conflict',
    description: 'Fresh fighting 2025-2026 between federal forces and Tigray rebels. Amhara Fano militia simultaneously active against Addis. Humanitarian access severely restricted in multiple regions.',
    updated: 'Mar 2026',
  },
  {
    name: 'Somalia — Al-Shabaab',
    lat: 2.0469, lng: 45.3182,
    severity: 'elevated', type: 'conflict',
    description: 'Al-Shabaab controls large rural territories. ACLED top-10 deadliest. Risk of US counterterrorism support withdrawal under Trump administration. AU mission mandate uncertain.',
    updated: 'Mar 2026',
  },
  {
    name: 'Mali / Burkina Faso — Sahel',
    lat: 12.3641, lng: -1.5275,
    severity: 'elevated', type: 'conflict',
    description: 'JNIM and ISGS jihadist insurgencies spreading. Both governments expelled French/UN forces. Russian Wagner/Africa Corps present. ACLED: Africa seeing proliferating armed groups challenging state authority.',
    updated: 'Mar 2026',
  },
  {
    name: 'Ecuador — Gang War',
    lat: -1.8312, lng: -78.1834,
    severity: 'elevated', type: 'conflict',
    description: 'ACLED ranked Ecuador #6 globally in conflict severity 2025. Los Lobos, R7, Choneros in full gang warfare. Multiple states of emergency. ACLED & FLACSO hosting Ecuador security webinar Mar 18 2026.',
    updated: 'Mar 2026',
  },
  {
    name: 'Brazil — Organised Crime',
    lat: -10.3333, lng: -53.2,
    severity: 'elevated', type: 'conflict',
    description: 'ACLED top-10 most severe globally. Leads "danger to civilians" ranking. PCC, CV and militias active in cities and Amazon. Among highest contributors to 240,000 global deaths in 2025.',
    updated: 'Mar 2026',
  },
  {
    name: 'Colombia — ELN / FARC Dissidents',
    lat: 4.571, lng: -74.2973,
    severity: 'elevated', type: 'conflict',
    description: 'Peace negotiations with ELN collapsed. FARC dissidents (EMC/FARC-EP) attacking communities. Post-Maduro Venezuela instability creating new border security vacuum.',
    updated: 'Mar 2026',
  },
  {
    name: 'Afghanistan',
    lat: 33.9391, lng: 67.71,
    severity: 'elevated', type: 'conflict',
    description: 'ISIS-K bombings continue under Taliban rule. Border clashes with Pakistan escalating after India-Pakistan tensions. 768 confirmed war-related deaths in 2024 (Rawadari). Humanitarian crisis worsening.',
    casualties: '768 confirmed killed (2024, Rawadari)',
    updated: 'Mar 2026',
  },
  {
    name: 'Mozambique — Cabo Delgado',
    lat: -12.3333, lng: 39.9167,
    severity: 'elevated', type: 'conflict',
    description: 'ISIS-affiliated Ansar al-Sunna attacks in Cabo Delgado province. LNG projects disrupted. Rwandan and SADC forces deployed with mixed results. Civilian displacement ongoing.',
    updated: 'Mar 2026',
  },

  // ── MONITORING — Flashpoints / Heightened tension ─────────────────────────

  {
    name: 'Taiwan Strait',
    lat: 24.2535, lng: 120.541,
    severity: 'monitoring', type: 'military',
    description: 'Taiwan Strait crisis rated ~50% likely in 2026 (CFR). Brookings: China watching US Middle East overextension. Xi does not need Venezuela pretext — will create its own. PLA exercises intensifying.',
    updated: 'Mar 2026',
  },
  {
    name: 'Korean Peninsula',
    lat: 37.9575, lng: 126.8544,
    severity: 'monitoring', type: 'military',
    description: 'North Korea elevated to Tier I risk (CFR 2026). DPRK troops deployed to Russia confirmed. Kim monitoring US Epic Fury overextension. ICBM tests continued. Nuclear arsenal growing.',
    updated: 'Mar 2026',
  },
  {
    name: 'South China Sea',
    lat: 14.5995, lng: 113.8247,
    severity: 'monitoring', type: 'military',
    description: 'PLA Navy and Philippine/US vessels in repeated confrontations at Second Thomas Shoal. China asserting control of Scarborough Shoal. US carrier repositioned to Middle East, reducing Pacific presence.',
    updated: 'Mar 2026',
  },
  {
    name: 'Kuwait — US Embassy / Al-Salem',
    lat: 29.3759, lng: 47.9774,
    severity: 'monitoring', type: 'base',
    description: 'US Embassy struck by Iranian missile (closed indefinitely). Ali Al Salem Air Base hit by complex missile-drone attack, causing major fire. Kuwaiti F/A-18 shot down 3 US F-15Es in friendly fire incident.',
    updated: 'Mar 2026',
  },
  {
    name: 'Azerbaijan — Nakhchivan',
    lat: 39.2009, lng: 45.4085,
    severity: 'monitoring', type: 'military',
    description: 'Iranian attack drones struck Nakhchivan International Airport causing civilian infrastructure damage. Azerbaijan placed military on highest alert and prepared retaliatory options against Iran.',
    updated: 'Mar 2026',
  },
  {
    name: 'Cyprus — UK Akrotiri Base',
    lat: 34.5775, lng: 32.9797,
    severity: 'monitoring', type: 'base',
    description: 'Britain\'s Akrotiri military base struck by Iranian drone (UK MOD confirmed). Britain authorised US use of UK bases for "defensive" Epic Fury strikes. RAF assets supporting Epic Fury operations.',
    updated: 'Mar 2026',
  },
  {
    name: 'Jordan — Strike Fallout',
    lat: 31.9566, lng: 35.9457,
    severity: 'monitoring', type: 'military',
    description: 'Iranian missiles reported in Jordanian airspace during Epic Fury retaliation. Jordan part of US-led intercept network. Balancing act: defending against Iran while managing Palestinian street pressure.',
    updated: 'Mar 2026',
  },
  {
    name: 'Libya — Tripoli',
    lat: 32.8872, lng: 13.1913,
    severity: 'monitoring', type: 'conflict',
    description: 'GNU vs eastern HoR/LNA fragmentation persists. Tripoli clashes intermittent. Russian Africa Corps entrenched in east Libya. Epic Fury destabilising Wagner supply routes through Libya.',
    updated: 'Mar 2026',
  },
  {
    name: 'NATO Eastern Flank — Baltic',
    lat: 54.6872, lng: 25.2797,
    severity: 'monitoring', type: 'base',
    description: 'Russian drone incursions into NATO airspace (Estonia, Latvia, Finland) intensified 2025-2026. Article 5 consultations triggered. Russia emboldened by US Epic Fury precedent (Brookings analysis).',
    updated: 'Mar 2026',
  },
  {
    name: 'Iraq — Power Grid / Erbil',
    lat: 33.2232, lng: 43.6793,
    severity: 'monitoring', type: 'military',
    description: 'Iraq national power grid collapsed during Epic Fury strikes and militia activity. Erbil explosion near US/coalition facilities. Italian installation in Iraq and French naval facility in UAE both struck by Iran.',
    updated: 'Mar 2026',
  },
  {
    name: 'Oman — Tanker War Zone',
    lat: 22.9437, lng: 57.5597,
    severity: 'monitoring', type: 'military',
    description: 'Two oil tankers struck off Oman coast. Iran hit own sanctioned "shadow fleet" Skylight in friendly fire. Oman had brokered nuclear breakthrough hours before Epic Fury began. Safesea Vishnu tanker attacked Mar 11.',
    casualties: '1 Indian crew member killed (Mar 11 attack)',
    updated: 'Mar 2026',
  },
]

// ─────────────────────────────────────────────────────────────────────────────

const LAYERS = [
  { id: 'conflicts', label: 'CONFLICT ZONES', active: true },
  { id: 'military', label: 'MILITARY / BASES', active: true },
  { id: 'nuclear', label: 'NUCLEAR SITES', active: false },
  { id: 'intel', label: 'INTEL HOTSPOTS', active: true },
]

const TIME_RANGES = ['1h', '6h', '24h', '48h', '7d', 'All']

function severityToMarkerSrc(severity: 'high' | 'elevated' | 'monitoring'): string {
  const colors = { high: '#ef4444', elevated: '#f59e0b', monitoring: '#3b82f6' }
  const c = colors[severity]
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>
    <circle cx='16' cy='16' r='14' fill='${c}' opacity='0.18'/>
    <circle cx='16' cy='16' r='9'  fill='${c}' opacity='0.50'/>
    <circle cx='16' cy='16' r='4'  fill='${c}'/>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WorldMap() {
  const [selectedRange, setSelectedRange] = useState('7d')
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    conflicts: true, military: true, nuclear: false, intel: true,
  })
  const [stats, setStats] = useState({ high: 0, elevated: 0, monitoring: 0 })
  const [selectedZone, setSelectedZone] = useState<ConflictZone | null>(null)

  const toggleLayer = (id: string) =>
    setActiveLayers((prev) => ({ ...prev, [id]: !prev[id] }))

  const markers: GlobeMarker[] = useMemo(() => {
    let high = 0, elevated = 0, monitoring = 0
    const result = CONFLICT_ZONES.filter((zone) =>
      (zone.type === 'conflict' && activeLayers.conflicts) ||
      (zone.type === 'military' && activeLayers.military)  ||
      (zone.type === 'nuclear'  && activeLayers.nuclear)   ||
      (zone.type === 'base'     && activeLayers.military)  ||
      (zone.type === 'cyber'    && activeLayers.intel)
    ).map((zone) => {
      if (zone.severity === 'high') high++
      else if (zone.severity === 'elevated') elevated++
      else monitoring++
      return { lat: zone.lat, lng: zone.lng, src: severityToMarkerSrc(zone.severity), label: zone.name, _zone: zone } as GlobeMarker & { _zone: ConflictZone }
    })
    setTimeout(() => setStats({ high, elevated, monitoring }), 0)
    return result
  }, [activeLayers])

  const handleMarkerClick = (marker: GlobeMarker) => {
    const m = marker as GlobeMarker & { _zone?: ConflictZone }
    if (m._zone) setSelectedZone(m._zone)
  }

  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedZone(null) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const sColor = (s: string) => s === 'high' ? '#ef4444' : s === 'elevated' ? '#f59e0b' : '#3b82f6'

  const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)

  return (
    <div className="relative w-full h-full">

      {/* Globe */}
      <div className="absolute inset-0 z-0">
        <Globe3D
          markers={markers}
          className="w-full h-full"
          config={{
            radius: 2,
            textureUrl: 'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
            bumpMapUrl: 'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png',
            showAtmosphere: true,
            atmosphereColor: '#1e3a8a',
            atmosphereIntensity: 12,
            atmosphereBlur: 3,
            bumpScale: 4,
            autoRotateSpeed: 0.2,
            enableZoom: true,
            enablePan: false,
            minDistance: 4,
            maxDistance: 12,
            ambientIntensity: 0.5,
            pointLightIntensity: 1.6,
            backgroundColor: '#080808',
            markerSize: 0.06,
          }}
          onMarkerClick={handleMarkerClick}
          onMarkerHover={() => {}}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-3 py-2 bg-[#080808]/95 border-b border-[#1a1a1a] backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
          <span className="text-[10px] text-[#ef4444] font-bold tracking-[0.2em]">LIVE CONFLICT MONITOR</span>
          <span className="text-[9px] text-[#444] ml-2">2025–2026 · 240,000+ DEATHS (ACLED)</span>
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
          <span className="text-[9px] text-[#444]">SRC: ACLED / CFR / IISS / BRITANNICA</span>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-12 left-3 z-[1000] flex flex-col gap-2">
        <div className="flex items-center gap-1 bg-[#111]/90 border border-[#262626] rounded p-1 backdrop-blur-sm">
          {TIME_RANGES.map((range) => (
            <button key={range} onClick={() => setSelectedRange(range)}
              className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${selectedRange === range ? 'bg-[#ef4444] text-[#000]' : 'text-[#888] hover:text-[#ccc]'}`}>
              {range}
            </button>
          ))}
        </div>

        <div className="bg-[#111]/90 border border-[#262626] rounded p-2 backdrop-blur-sm min-w-[190px]">
          <div className="text-[9px] text-[#666] font-bold tracking-widest mb-2">LAYERS</div>
          {LAYERS.map((layer) => (
            <label key={layer.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-[#1a1a1a] px-1 rounded">
              <input type="checkbox" checked={activeLayers[layer.id]} onChange={() => toggleLayer(layer.id)}
                className="w-3 h-3 rounded accent-[#ef4444] bg-[#222] border-[#444]" />
              <span className="text-[10px] text-[#ccc] tracking-wider font-medium">{layer.label}</span>
            </label>
          ))}
        </div>

        {/* Active ops ticker */}
        <div className="bg-[#111]/90 border border-[#ef444433] rounded p-2 backdrop-blur-sm min-w-[190px]">
          <div className="text-[9px] text-[#ef4444] font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />ACTIVE OPS
          </div>
          <div className="space-y-1 text-[9px]">
            <div className="text-[#ef4444]">▶ Op. Epic Fury — Iran (Day {daysSince('2026-02-28')})</div>
            <div className="text-[#f59e0b]">▶ Op. Absolute Resolve — Venezuela</div>
            <div className="text-[#888]">▶ Russia–Ukraine — Day {daysSince('2022-02-24')}</div>
            <div className="text-[#888]">▶ Gaza — Day {daysSince('2023-10-07')}</div>
            <div className="text-[#888]">▶ Sudan Civil War — Day {daysSince('2023-04-15')}</div>
          </div>
        </div>
      </div>

      {/* Zone detail popup */}
      {selectedZone && (
        <div className="absolute top-12 right-3 z-[1000] w-72 bg-[#0d0d0d] border rounded p-3 backdrop-blur-sm shadow-2xl"
          style={{ borderColor: `${sColor(selectedZone.severity)}44` }}>
          <div className="flex items-start justify-between mb-2">
            <div className="text-[11px] font-bold leading-tight pr-2" style={{ color: sColor(selectedZone.severity) }}>
              {selectedZone.name}
            </div>
            <button onClick={() => setSelectedZone(null)} className="text-[#555] hover:text-[#aaa] text-[14px] leading-none flex-shrink-0">✕</button>
          </div>
          <p className="text-[10px] text-[#888] leading-relaxed mb-2">{selectedZone.description}</p>
          {selectedZone.casualties && (
            <p className="text-[9px] text-[#666] mb-2">⚠ {selectedZone.casualties}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded"
              style={{ background: sColor(selectedZone.severity), color: '#000' }}>
              {selectedZone.severity.toUpperCase()}
            </span>
            <span className="text-[9px] text-[#555]">{selectedZone.type.toUpperCase()}</span>
            {selectedZone.updated && (
              <span className="text-[9px] text-[#444] ml-auto">↻ {selectedZone.updated}</span>
            )}
          </div>
        </div>
      )}

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
        NASA Blue Marble · ACLED · CFR · IISS · Britannica
      </div>
    </div>
  )
}