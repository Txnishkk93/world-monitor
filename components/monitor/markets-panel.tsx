'use client'

import useSWR from 'swr'
import { ArrowUp, ArrowDown } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface MarketQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

function QuoteRow({ quote }: { quote: MarketQuote }) {
  const isPositive = quote.change >= 0

  return (
    <div className="flex items-center justify-between py-1.5 px-2.5 border-b border-[#1a1a1a] last:border-0 hover:bg-[#1a1a1a]">
      <div>
        <div className="text-[11px] text-[#e0e0e0] font-medium">{quote.name}</div>
        <div className="text-[9px] text-[#555]">{quote.symbol}</div>
      </div>
      <div className="text-right flex items-center gap-2">
        <span className="text-[12px] text-[#e0e0e0] font-bold font-mono">
          ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <div className={`flex items-center gap-0.5 ${isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
          {isPositive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          <span className="text-[10px] font-mono font-bold">
            {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}

function CommodityCard({ quote }: { quote: MarketQuote }) {
  const isPositive = quote.change >= 0

  return (
    <div className="p-2.5">
      <div className="text-[9px] text-[#888] font-bold tracking-wider mb-1">{quote.name.toUpperCase()}</div>
      <div className="text-[16px] text-[#e0e0e0] font-bold font-mono">
        ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className={`text-[10px] font-mono font-bold ${isPositive ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
        {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
      </div>
    </div>
  )
}

export default function MarketsPanel() {
  const { data } = useSWR('/api/markets', fetcher, {
    refreshInterval: 120000,
    revalidateOnFocus: true,
  })

  const stocks: MarketQuote[] = data?.stocks || []
  const commodities: MarketQuote[] = data?.commodities || []
  const indices: MarketQuote[] = data?.indices || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      {/* Markets */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d]">
          <span className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0]">MARKETS</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#22c55e] text-[#000] font-bold">LIVE</span>
        </div>
        <div className="max-h-[180px] overflow-y-auto scrollbar-thin">
          {stocks.length > 0 ? (
            stocks.map((q) => <QuoteRow key={q.symbol} quote={q} />)
          ) : (
            <div className="p-4 text-center text-[10px] text-[#555]">Loading market data...</div>
          )}
        </div>
      </div>

      {/* Commodities */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d]">
          <span className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0]">COMMODITIES</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#1a1a1a]">
          {commodities.length > 0 ? (
            commodities.slice(0, 4).map((q) => <CommodityCard key={q.symbol} quote={q} />)
          ) : (
            <div className="col-span-2 p-4 text-center text-[10px] text-[#555]">Loading...</div>
          )}
        </div>
      </div>

      {/* Indices */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e] bg-[#0d0d0d]">
          <span className="text-[10px] font-bold tracking-[0.15em] text-[#e0e0e0]">ECONOMIC INDICATORS</span>
        </div>
        <div className="max-h-[180px] overflow-y-auto scrollbar-thin">
          {indices.length > 0 ? (
            indices.map((q) => <QuoteRow key={q.symbol} quote={q} />)
          ) : (
            <div className="p-4 text-center text-[10px] text-[#555]">Loading indices...</div>
          )}
        </div>
      </div>
    </div>
  )
}
