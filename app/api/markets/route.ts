import { NextResponse } from 'next/server'

interface MarketQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'META', name: 'Meta' },
]

const COMMODITIES = [
  { symbol: 'CL=F', name: 'Crude Oil', shortName: 'NY CRUDE' },
  { symbol: 'GC=F', name: 'Gold', shortName: 'GOLD' },
  { symbol: 'SI=F', name: 'Silver', shortName: 'SILVER' },
  { symbol: 'NG=F', name: 'Natural Gas', shortName: 'NAT GAS' },
]

const INDICES = [
  { symbol: '^VIX', name: 'VIX', shortName: 'VIX' },
  { symbol: '^GSPC', name: 'S&P 500', shortName: 'S&P 500' },
  { symbol: '^DJI', name: 'Dow Jones', shortName: 'DOW' },
]

async function fetchYahooFinance(symbols: string[]): Promise<MarketQuote[]> {
  const quotes: MarketQuote[] = []

  for (const sym of symbols) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 120 },
      })

      if (!res.ok) continue

      const data = await res.json()
      const result = data?.chart?.result?.[0]
      if (!result) continue

      const meta = result.meta
      const price = meta.regularMarketPrice || 0
      const prevClose = meta.chartPreviousClose || meta.previousClose || price
      const change = price - prevClose
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0

      const nameMap: Record<string, string> = {}
      for (const s of [...SYMBOLS, ...COMMODITIES, ...INDICES]) {
        nameMap[s.symbol] = 'shortName' in s ? (s as { shortName: string }).shortName : s.name
      }

      quotes.push({
        symbol: sym,
        name: nameMap[sym] || meta.shortName || sym,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
      })
    } catch {
      continue
    }
  }

  return quotes
}

export async function GET() {
  try {
    const [stocks, commodities, indices] = await Promise.all([
      fetchYahooFinance(SYMBOLS.map((s) => s.symbol)),
      fetchYahooFinance(COMMODITIES.map((s) => s.symbol)),
      fetchYahooFinance(INDICES.map((s) => s.symbol)),
    ])

    return NextResponse.json({
      success: true,
      stocks,
      commodities,
      indices,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Markets API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data', stocks: [], commodities: [], indices: [] },
      { status: 500 }
    )
  }
}
