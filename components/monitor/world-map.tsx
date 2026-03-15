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
// Updated March 2026 — ACLED Conflict Index + CFR Preventive Priorities 2026
const COUNTRY_ALERTS: CountryAlert[] = [
  // HIGH — active war / mass casualties
  { iso2: 'PS', severity: 'high' }, // Palestine (Gaza + West Bank)
  { iso2: 'UA', severity: 'high' }, // Ukraine
  { iso2: 'SD', severity: 'high' }, // Sudan
  { iso2: 'MM', severity: 'high' }, // Myanmar
  { iso2: 'IR', severity: 'high' }, // Iran (Op. Epic Fury)
  { iso2: 'CD', severity: 'high' }, // DR Congo
  { iso2: 'HT', severity: 'high' }, // Haiti
  { iso2: 'MX', severity: 'high' }, // Mexico (cartel war)
  { iso2: 'IL', severity: 'high' }, // Israel (multi-front war)
  { iso2: 'LB', severity: 'high' }, // Lebanon (2026 war)
  // ELEVATED
  { iso2: 'YE', severity: 'elevated' }, // Yemen
  { iso2: 'SY', severity: 'elevated' }, // Syria
  { iso2: 'SO', severity: 'elevated' }, // Somalia
  { iso2: 'ET', severity: 'elevated' }, // Ethiopia
  { iso2: 'NG', severity: 'elevated' }, // Nigeria
  { iso2: 'PK', severity: 'elevated' }, // Pakistan
  { iso2: 'CO', severity: 'elevated' }, // Colombia
  { iso2: 'ML', severity: 'elevated' }, // Mali
  { iso2: 'BF', severity: 'elevated' }, // Burkina Faso
  { iso2: 'IQ', severity: 'elevated' }, // Iraq
  { iso2: 'EC', severity: 'elevated' }, // Ecuador
  { iso2: 'AF', severity: 'elevated' }, // Afghanistan
  { iso2: 'VE', severity: 'elevated' }, // Venezuela (post-Maduro)
  { iso2: 'MZ', severity: 'elevated' }, // Mozambique
  { iso2: 'AE', severity: 'elevated' }, // UAE (Iranian strikes)
  { iso2: 'BH', severity: 'elevated' }, // Bahrain (5th Fleet attacked)
  { iso2: 'BR', severity: 'elevated' }, // Brazil (gang violence — ACLED top-10)
  { iso2: 'NE', severity: 'elevated' }, // Niger (Sahel)
  { iso2: 'CF', severity: 'elevated' }, // Central African Republic
  { iso2: 'SS', severity: 'elevated' }, // South Sudan
  // MONITORING
  { iso2: 'TW', severity: 'monitoring' }, // Taiwan
  { iso2: 'KP', severity: 'monitoring' }, // North Korea
  { iso2: 'LY', severity: 'monitoring' }, // Libya
  { iso2: 'JO', severity: 'monitoring' }, // Jordan (Iranian missile zone)
  { iso2: 'SA', severity: 'monitoring' }, // Saudi Arabia (base attacks)
  { iso2: 'QA', severity: 'monitoring' }, // Qatar (Al Udeid targeted)
  { iso2: 'KW', severity: 'monitoring' }, // Kuwait (US Embassy struck)
  { iso2: 'AZ', severity: 'monitoring' }, // Azerbaijan (drone strikes)
  { iso2: 'CY', severity: 'monitoring' }, // Cyprus (Akrotiri base struck)
]

const COUNTRY_ALERT_MAP: Record<string, 'high' | 'elevated' | 'monitoring'> = {}
COUNTRY_ALERTS.forEach((a) => { COUNTRY_ALERT_MAP[a.iso2] = a.severity })

// ─────────────────────────────────────────────────────────────────────────────
// CONFLICT ZONES — Real-world data
// Sources: ACLED Conflict Index 2025, CFR Preventive Priorities 2026,
//          IISS, Britannica, Wikipedia — verified March 15 2026
// Global deaths 2025: 240,000+ (ACLED, Dec 2024–Nov 2025)
// ─────────────────────────────────────────────────────────────────────────────

const CONFLICT_ZONES: ConflictZone[] = [

  // ── HIGH SEVERITY — Active war / mass casualties ──────────────────────────

  {
    name: 'Gaza Strip',
    lat: 31.3547, lng: 34.3088,
    severity: 'high', type: 'conflict',
    description: 'Ongoing Israel–Hamas war. Most geographically diffuse conflict globally — violence in ~70% of Gaza and West Bank (ACLED). UN labels humanitarian situation catastrophic. No meaningful ceasefire.',
    casualties: '21,417 killed Aug 2024–Aug 2025 (ACLED)',
    updated: 'Mar 2026',
  },
  {
    name: 'West Bank — IDF Operations',
    lat: 31.9522, lng: 35.2332,
    severity: 'high', type: 'conflict',
    description: 'Escalating IDF operations in Jenin, Tulkarm and Nablus. Record settler violence. Post-Epic Fury spillover increasing pressure on West Bank.',
    updated: 'Mar 2026',
  },
  {
    name: 'Lebanon — 2026 War',
    lat: 33.8938, lng: 35.5018,
    severity: 'high', type: 'conflict',
    description: 'Nov 2024 ceasefire collapsed early 2026. Hezbollah resumed full missile/drone attacks Feb 28 coordinated with Iranian retaliation. Israeli military struck 500+ targets across Lebanon including Beirut suburbs.',
    casualties: '12+ Israelis killed; Lebanese toll rising',
    updated: 'Mar 2026',
  },
  {
    name: 'Iran — Operation Epic Fury',
    lat: 35.6892, lng: 51.389,
    severity: 'high', type: 'military',
    description: 'US-Israeli Op. Epic Fury launched Feb 28 2026: ~900 strikes in 12 hrs. Supreme Leader Khamenei killed. Iran retaliating across 9 countries with 400+ missiles and drones. Demonstrations recorded in 990+ cities worldwide (ACLED).',
    casualties: '2,000+ killed; 6,668+ civilian units struck (Iranian Red Crescent)',
    updated: 'Mar 2026',
  },
  {
    name: 'Iran — Strait of Hormuz',
    lat: 26.5667, lng: 56.25,
    severity: 'high', type: 'military',
    description: 'Iran blockading Strait of Hormuz in retaliation for Epic Fury. 150 freight ships stalled. IRGC attacking oil tankers and energy infrastructure. Iran also struck its own shadow fleet by mistake (Skylight tanker).',
    casualties: 'Multiple tanker crews hit; 1 Indian sailor killed Mar 11',
    updated: 'Mar 2026',
  },
  {
    name: 'Iran — Nuclear Sites (Parchin / Isfahan)',
    lat: 32.5, lng: 51.7,
    severity: 'high', type: 'nuclear',
    description: 'US struck Iran Atomic Energy Agency HQ, Parchin explosive research facility, and Isfahan nuclear complex during Epic Fury. Bushehr reactor staff evacuated. Radiological contamination risk flagged by CSIS.',
    updated: 'Mar 2026',
  },
  {
    name: 'Ukraine — Eastern Front',
    lat: 48.3794, lng: 31.1656,
    severity: 'high', type: 'conflict',
    description: 'Russia–Ukraine war. Russia controls ~20% of internationally recognised Ukraine. Ukraine + Gaza drove 40%+ of all global conflict events in 2025 (ACLED). Air and drone strikes at all-time high globally.',
    casualties: '200,000–285,000 Russian troops; ~1M total casualties est.',
    updated: 'Mar 2026',
  },
  {
    name: 'Ukraine — Kyiv Infrastructure',
    lat: 50.45, lng: 30.5241,
    severity: 'high', type: 'military',
    description: 'Russian strikes on Kyiv and western cities intensifying 2026. Power grid and civilian infrastructure systematically targeted. Global air/drone strikes reached unprecedented peak in 2025 (ACLED).',
    updated: 'Mar 2026',
  },
  {
    name: 'Sudan — Khartoum / Darfur',
    lat: 15.5007, lng: 32.5599,
    severity: 'high', type: 'conflict',
    description: 'SAF vs RSF civil war entering 3rd year. ACLED documented 198 drone strikes in Jan–Feb 2026 alone — 52 with civilian casualties, killing 478. 12M+ displaced. Famine declared in multiple areas. Africa\'s deadliest conflict for civilians.',
    casualties: '20,373 killed Aug 2024–Aug 2025; +478 Jan–Feb 2026 (ACLED)',
    updated: 'Mar 2026',
  },
  {
    name: 'Sudan — El Fasher (North Darfur)',
    lat: 13.6287, lng: 25.3497,
    severity: 'high', type: 'conflict',
    description: 'RSF siege of last SAF-held city in Darfur. UN genocide risk flagged. SAF and RSF consolidating territory in Kordofan and Darfur. International ceasefire efforts facing major obstacles (ACLED / Newsweek 2026).',
    casualties: 'Genocide risk confirmed (UN)',
    updated: 'Mar 2026',
  },
  {
    name: 'Myanmar — Civil War',
    lat: 19.7633, lng: 96.0785,
    severity: 'high', type: 'conflict',
    description: 'World\'s most fragmented conflict: 1,200+ distinct armed groups (ACLED). Junta vs resistance. World\'s longest ongoing civil war since 1948. ACLED "Extreme" severity. Junta reliance on ethnic divisions perpetuating instability.',
    casualties: '15,420 killed mid-2024 to mid-2025 (Britannica/ACLED)',
    updated: 'Mar 2026',
  },
  {
    name: 'DR Congo — Goma / East DRC',
    lat: -1.6596, lng: 29.2225,
    severity: 'high', type: 'conflict',
    description: 'Rwanda-backed M23 controls Goma. ACLED senior analyst Ladd Serwat notes military offensive to recapture M23 territory underway. FDLR and 100+ armed groups active. ACLED top-10 deadliest conflict globally.',
    casualties: 'Decades-long; tens of thousands annually',
    updated: 'Mar 2026',
  },
  {
    name: 'Haiti — Gang Violence',
    lat: 18.5944, lng: -72.3074,
    severity: 'high', type: 'conflict',
    description: 'Gangs control Port-au-Prince. ACLED: 4,500+ Haitians killed from political violence 2025. Ranked top-10 globally for deadliness AND danger to civilians. State near total collapse. Op. Epic Fury may reduce US regional focus (ACLED).',
    casualties: '4,500+ killed 2025 (ACLED)',
    updated: 'Mar 2026',
  },
  {
    name: 'Mexico — Cartel Armed Conflict',
    lat: 23.6345, lng: -102.5528,
    severity: 'high', type: 'conflict',
    description: 'ACLED Conflict Index: Palestine, Myanmar, Syria, and Mexico hold highest positions. Mexico top-10 globally for deadliness and danger to civilians. CJNG vs Sinaloa Cartel full territorial war. Puerto Vallarta shelter-in-place Mar 2026.',
    updated: 'Mar 2026',
  },

  // ── ELEVATED SEVERITY ─────────────────────────────────────────────────────

  {
    name: 'Venezuela — Post-Intervention',
    lat: 10.4806, lng: -66.9036,
    severity: 'elevated', type: 'military',
    description: 'US Delta Force Op. Absolute Resolve (Jan 3 2026) captured Maduro using 150+ aircraft. VP Rodríguez acting president. ACLED: Epic Fury may alter political calculus for Cuba and Venezuela. Trump threatens second operation.',
    updated: 'Mar 2026',
  },
  {
    name: 'Iraq — Militia Attacks / Grid Collapse',
    lat: 33.3128, lng: 44.3615,
    severity: 'elevated', type: 'military',
    description: 'US/Israeli strikes on Iran-backed Iraqi militias Feb 28–Mar 1. Victory Base Complex near Baghdad Airport hit by FPV drone. Iraq national power grid collapsed. CENTCOM: precision munitions delivered via fixed/rotary-wing/UAS (Mar 2026).',
    updated: 'Mar 2026',
  },
  {
    name: 'UAE — Dubai / Jebel Ali',
    lat: 25.2048, lng: 55.2708,
    severity: 'elevated', type: 'military',
    description: 'Iran launched missiles targeting UAE during Epic Fury retaliation. Dubai Airport struck. Burj Al Arab drone debris fire. Jebel Ali port debris fire. UAE signaling willingness for direct military response against Iran.',
    updated: 'Mar 2026',
  },
  {
    name: 'Bahrain — US 5th Fleet HQ',
    lat: 26.0667, lng: 50.5577,
    severity: 'elevated', type: 'base',
    description: 'US Navy 5th Fleet HQ in Manama targeted by Iranian Shahed drones. Crowne Plaza hotel struck, civilian casualties confirmed. 3 US servicemembers KIA, 5 seriously wounded (CENTCOM confirmed Mar 1 2026).',
    casualties: '3 US KIA; 5 seriously wounded (CENTCOM)',
    updated: 'Mar 2026',
  },
  {
    name: 'Qatar — Al Udeid Air Base',
    lat: 25.1167, lng: 51.3167,
    severity: 'elevated', type: 'base',
    description: 'Iran targeted Al Udeid — largest US air base in Middle East — during Epic Fury retaliation. Ballistic missiles intercepted. Qatar scrambled all defenses.',
    updated: 'Mar 2026',
  },
  {
    name: 'Saudi Arabia — Prince Sultan AB',
    lat: 23.9716, lng: 45.4386,
    severity: 'elevated', type: 'base',
    description: 'Iranian missiles targeting Prince Sultan Airbase (hosts US troops) intercepted. Saudi Arabia invoked right of self-defense. Crown Prince vowed military response to Iranian aggression.',
    updated: 'Mar 2026',
  },
  {
    name: 'Yemen — Houthi Resurgence',
    lat: 15.5527, lng: 48.5164,
    severity: 'elevated', type: 'conflict',
    description: 'Houthis resumed Red Sea shipping attacks in coordination with Iranian Epic Fury retaliation. 2025 ceasefire broken. US carrier group conducting counterstrikes. Iran also attacked energy infrastructure across Gulf.',
    updated: 'Mar 2026',
  },
  {
    name: 'Syria — Post-Assad Conflict',
    lat: 33.5138, lng: 36.2765,
    severity: 'elevated', type: 'conflict',
    description: 'ISIS cells resurging despite Assad fall. Israeli airstrikes continuing on Hezbollah/IRGC sites. ACLED: Palestine, Myanmar, Syria and Mexico hold highest conflict index positions. Sectarian violence unresolved.',
    updated: 'Mar 2026',
  },
  {
    name: 'Pakistan — Northwest / Balochistan',
    lat: 31.5204, lng: 74.3587,
    severity: 'elevated', type: 'conflict',
    description: 'ACLED 2026: Pakistan became "more dangerous for civilians." TTP and separatist insurgencies escalating. Separatist activity in Balochistan likely to increase, fueled by poppy cultivation and mining disputes (ACLED/Newsweek).',
    casualties: '26 civilians killed Pahalgam attack (Apr 2025)',
    updated: 'Mar 2026',
  },
  {
    name: 'India–Pakistan — Kashmir LoC',
    lat: 34.0837, lng: 74.7973,
    severity: 'elevated', type: 'military',
    description: 'May 2025: first direct India-Pakistan military exchange in decades following Pahalgam terror attack. Short-lived but intense four-day escalation. Nuclear-armed standoff. ACLED: Pakistan deaths from political violence increased.',
    casualties: '26 civilians killed (Pahalgam, Apr 2025)',
    updated: 'Mar 2026',
  },
  {
    name: 'Nigeria — Boko Haram / ISWAP',
    lat: 10.4515, lng: 7.5402,
    severity: 'elevated', type: 'conflict',
    description: 'ACLED top-10 deadliest globally. "No respite from its complex patchwork of regional conflicts" in 2025 (ACLED). Boko Haram, ISWAP, herder-farmer violence and organised banditry all active simultaneously.',
    updated: 'Mar 2026',
  },
  {
    name: 'Ethiopia — Tigray / Amhara',
    lat: 13.4967, lng: 38.4955,
    severity: 'elevated', type: 'conflict',
    description: 'Fresh fighting 2025-2026 between federal forces and Tigray rebels. Amhara Fano militia simultaneously active against federal government. Humanitarian access severely restricted. International ceasefire stalled.',
    updated: 'Mar 2026',
  },
  {
    name: 'Somalia — Al-Shabaab',
    lat: 2.0469, lng: 45.3182,
    severity: 'elevated', type: 'conflict',
    description: 'Al-Shabaab controls large rural territories. ACLED top-10 deadliest conflict. Risk of US counterterrorism support withdrawal under Trump administration — could accelerate territorial losses for Somali government.',
    updated: 'Mar 2026',
  },
  {
    name: 'Mali / Burkina Faso / Niger — Sahel',
    lat: 12.3641, lng: -1.5275,
    severity: 'elevated', type: 'conflict',
    description: 'JNIM and ISGS jihadist insurgencies spreading across Sahel. All three governments expelled Western/UN forces. Russian Wagner/Africa Corps present. Security vacuum threatening stability of entire West African coast (ACLED 2026 Watchlist).',
    updated: 'Mar 2026',
  },
  {
    name: 'Ecuador — Gang War',
    lat: -1.8312, lng: -78.1834,
    severity: 'elevated', type: 'conflict',
    description: 'ACLED ranked Ecuador #6 globally in conflict severity 2025. FLACSO/ACLED hosting Ecuador security webinar Mar 18 2026 on gang violence and US influence in shaping security policy. Multiple states of emergency declared.',
    updated: 'Mar 2026',
  },
  {
    name: 'Brazil — Organised Crime',
    lat: -10.3333, lng: -53.2,
    severity: 'elevated', type: 'conflict',
    description: 'ACLED top-10 most severe globally. Leads "danger to civilians" ranking. PCC, CV and militias active in cities and Amazon. Latin America/Caribbean governments expanding military roles in policing ahead of elections (ACLED 2026).',
    updated: 'Mar 2026',
  },
  {
    name: 'Colombia — ELN / FARC Dissidents',
    lat: 4.571, lng: -74.2973,
    severity: 'elevated', type: 'conflict',
    description: 'Peace negotiations with ELN collapsed. FARC dissidents (EMC) attacking communities. Post-Maduro Venezuela instability creating new border security vacuum. Colombia adopting tougher security measures (ACLED 2026 Watchlist).',
    updated: 'Mar 2026',
  },
  {
    name: 'Afghanistan',
    lat: 33.9391, lng: 67.71,
    severity: 'elevated', type: 'conflict',
    description: 'ISIS-K bombings continue under Taliban rule. Porous border allows TTP to regroup. Separatist activity in Balochistan spilling from Pakistan. 768 confirmed war-related deaths 2024 (Rawadari). Humanitarian crisis worsening.',
    casualties: '768 war-related deaths (2024, Rawadari)',
    updated: 'Mar 2026',
  },
  {
    name: 'Central African Republic',
    lat: 6.6111, lng: 20.9394,
    severity: 'elevated', type: 'conflict',
    description: 'Russian Wagner/Africa Corps entrenched. Armed group activity persists. CPC coalition vs FACA/Wagner ongoing. Civilian targeting documented. ACLED elevated severity.',
    updated: 'Mar 2026',
  },
  {
    name: 'South Sudan',
    lat: 6.877, lng: 31.307,
    severity: 'elevated', type: 'conflict',
    description: 'Renewed inter-communal violence. Peace agreement fragile. Humanitarian crisis with 9M+ people in need. Oil revenue disputes between factions. Risk of return to large-scale civil war (CFR 2026).',
    updated: 'Mar 2026',
  },
  {
    name: 'Mozambique — Cabo Delgado',
    lat: -12.3333, lng: 39.9167,
    severity: 'elevated', type: 'conflict',
    description: 'ISIS-affiliated Ansar al-Sunna attacks in northern Cabo Delgado. LNG projects disrupted. Rwandan and SADC forces deployed. Collaboration between forces described as "step in the right direction" (ACLED West Africa analyst).',
    updated: 'Mar 2026',
  },
  {
    name: 'Red Sea / Bab al-Mandeb',
    lat: 12.8628, lng: 43.1425,
    severity: 'elevated', type: 'military',
    description: 'Houthis and Iran attacking energy infrastructure and shipping in Gulf/Red Sea. Iran retaliated against Israel\'s attacks on its oil facilities by targeting energy infrastructure and vessels across Gulf and Strait of Hormuz (ACLED).',
    updated: 'Mar 2026',
  },

  // ── MONITORING — Flashpoints / heightened tension ─────────────────────────

  {
    name: 'Taiwan Strait',
    lat: 24.2535, lng: 120.541,
    severity: 'monitoring', type: 'military',
    description: 'CFR 2026 Tier I risk. Taiwan Strait crisis ~50% likely in 2026. China watching US Epic Fury overextension. PLA does not need Venezuela pretext — will create its own justification (Brookings). PLA exercises intensifying.',
    updated: 'Mar 2026',
  },
  {
    name: 'Korean Peninsula',
    lat: 37.9575, lng: 126.8544,
    severity: 'monitoring', type: 'military',
    description: 'North Korea elevated to CFR Tier I risk 2026. DPRK troops confirmed deployed to Russia. Kim monitoring US Epic Fury engagement. ICBM tests continued 2025. Nuclear arsenal growing.',
    updated: 'Mar 2026',
  },
  {
    name: 'South China Sea',
    lat: 14.5995, lng: 113.8247,
    severity: 'monitoring', type: 'military',
    description: 'PLA Navy and Philippine/US vessels in repeated confrontations at Second Thomas Shoal. China asserting Scarborough Shoal control. US carrier partially repositioned to Middle East, reducing Indo-Pacific presence.',
    updated: 'Mar 2026',
  },
  {
    name: 'Kuwait — US Embassy / Al-Salem AB',
    lat: 29.3759, lng: 47.9774,
    severity: 'monitoring', type: 'base',
    description: 'US Embassy struck by Iranian missile during Epic Fury retaliation (closed indefinitely). Ali Al Salem Air Base hit causing major fire. Kuwaiti F/A-18 shot down 3 US F-15Es in friendly-fire incident.',
    updated: 'Mar 2026',
  },
  {
    name: 'Azerbaijan — Nakhchivan',
    lat: 39.2009, lng: 45.4085,
    severity: 'monitoring', type: 'military',
    description: 'Iranian attack drones struck Nakhchivan International Airport during Epic Fury retaliation. Azerbaijan placed military on highest alert and prepared retaliatory options against Iran.',
    updated: 'Mar 2026',
  },
  {
    name: 'Cyprus — UK Akrotiri Base',
    lat: 34.5775, lng: 32.9797,
    severity: 'monitoring', type: 'base',
    description: 'Britain\'s Akrotiri base struck by Iranian drone (UK MOD confirmed). Britain authorised US use of UK bases for "defensive" Epic Fury strikes. RAF assets supporting operations.',
    updated: 'Mar 2026',
  },
  {
    name: 'Jordan — Iranian Strike Zone',
    lat: 31.9566, lng: 35.9457,
    severity: 'monitoring', type: 'military',
    description: 'Iranian missiles transited/fell in Jordanian airspace during Epic Fury retaliation. Jordan part of US-led intercept network. Balancing act between defending against Iran and managing Palestinian domestic sentiment.',
    updated: 'Mar 2026',
  },
  {
    name: 'Libya — Tripoli',
    lat: 32.8872, lng: 13.1913,
    severity: 'monitoring', type: 'conflict',
    description: 'GNU vs eastern HoR/LNA fragmentation. Russian Africa Corps entrenched in east. Epic Fury potentially destabilising Wagner supply routes. Clashes in Tripoli intermittent. No unification deal in sight.',
    updated: 'Mar 2026',
  },
  {
    name: 'NATO Eastern Flank — Baltic',
    lat: 54.6872, lng: 25.2797,
    severity: 'monitoring', type: 'base',
    description: 'Russian drone incursions into NATO airspace (Estonia, Latvia, Finland) intensified 2025-2026. Article 5 consultations triggered. Russia emboldened by US Epic Fury precedent; governments in Europe generating more conflict (ACLED 2025).',
    updated: 'Mar 2026',
  },
  {
    name: 'Oman — Tanker War Zone',
    lat: 22.9437, lng: 57.5597,
    severity: 'monitoring', type: 'military',
    description: 'Two oil tankers struck off Oman during Epic Fury. Iran hit own sanctioned shadow fleet Skylight in friendly fire. Safesea Vishnu tanker attacked Mar 11 (1 Indian crew killed). Oman had brokered nuclear deal hours before Epic Fury.',
    casualties: '1 Indian crew killed (Mar 11 2026)',
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
              ;(layer as import('leaflet').Path).setStyle({ fillOpacity: fillOpacity + 0.25, weight: 2 })
            })
            layer.on('mouseout', () => {
              ;(layer as import('leaflet').Path).setStyle({ fillOpacity, weight: severity === 'high' ? 1.2 : 0.8 })
            })
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

  // Update pulsing circle markers when layers change
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

      const popupContent = `
        <div style="background:#0d0d0d;color:#e0e0e0;padding:10px 12px;border-radius:4px;font-family:monospace;font-size:11px;min-width:200px;border:1px solid ${color}44;box-shadow:0 0 20px ${color}22;">
          <div style="font-weight:700;margin-bottom:5px;color:${color};font-size:12px;">${zone.name}</div>
          <div style="color:#aaa;font-size:10px;margin-bottom:6px;line-height:1.5">${zone.description}</div>
          ${zone.casualties ? `<div style="color:#888;font-size:9px;margin-bottom:4px">⚠ ${zone.casualties}</div>` : ''}
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
        .bindPopup(popupContent, { className: 'dark-popup', maxWidth: 300 })
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

      {/* Controls overlay */}
      <div className="absolute top-12 left-3 z-[1000] flex flex-col gap-2">
        {/* Time range */}
        <div className="flex items-center gap-1 bg-[#111]/90 border border-[#262626] rounded p-1 backdrop-blur-sm">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${
                selectedRange === range ? 'bg-[#ef4444] text-[#000]' : 'text-[#888] hover:text-[#ccc]'
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
        CARTO &copy; OpenStreetMap · ACLED · CFR · IISS
      </div>
    </div>
  )
}