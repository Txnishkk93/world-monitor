import { NextResponse } from 'next/server'

interface FeedItem {
  title: string
  link: string
  pubDate: string
  contentSnippet?: string
  content?: string
  source: string
  category: string
}

const RSS_FEEDS: Record<string, { url: string; source: string; category: string }[]> = {
  world: [
    { url: 'https://feeds.reuters.com/Reuters/worldNews', source: 'REUTERS', category: 'WORLD NEWS' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY TIMES', category: 'WORLD NEWS' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC WORLD', category: 'WORLD NEWS' },
  ],
  us: [
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml', source: 'NY TIMES', category: 'UNITED STATES' },
    { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR NEWS', category: 'UNITED STATES' },
  ],
  europe: [
    { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC EUROPE', category: 'EUROPE' },
    { url: 'https://www.lemonde.fr/en/rss/une.xml', source: 'LE MONDE', category: 'EUROPE' },
  ],
  middleeast: [
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC MIDEAST', category: 'MIDDLE EAST' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', source: 'NY TIMES', category: 'MIDDLE EAST' },
  ],
  africa: [
    { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC AFRICA', category: 'AFRICA' },
  ],
  asia: [
    { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC ASIA', category: 'ASIA-PACIFIC' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/AsiaPacific.xml', source: 'NY TIMES', category: 'ASIA-PACIFIC' },
  ],
  latinamerica: [
    { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', source: 'BBC LATAM', category: 'LATIN AMERICA' },
  ],
  politics: [
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NY TIMES', category: 'GOVERNMENT' },
    { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC POLITICS', category: 'GOVERNMENT' },
  ],
  business: [
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC BUSINESS', category: 'ENERGY & RESOURCES' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NY TIMES', category: 'ENERGY & RESOURCES' },
  ],
  technology: [
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC TECH', category: 'THINK TANKS' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NY TIMES', category: 'THINK TANKS' },
  ],
}

function parseRSSXML(xml: string, source: string, category: string): FeedItem[] {
  const items: FeedItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title = extractTag(itemXml, 'title')
    const link = extractTag(itemXml, 'link')
    const pubDate = extractTag(itemXml, 'pubDate')
    const description = extractTag(itemXml, 'description')

    if (title) {
      items.push({
        title: cleanHTML(title),
        link: link || '',
        pubDate: pubDate || new Date().toISOString(),
        contentSnippet: description ? cleanHTML(description).slice(0, 200) : '',
        source,
        category,
      })
    }
  }

  return items.slice(0, 5)
}

function extractTag(xml: string, tag: string): string | null {
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`)
  const cdataMatch = cdataRegex.exec(xml)
  if (cdataMatch) return cdataMatch[1]

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const match = regex.exec(xml)
  return match ? match[1] : null
}

function cleanHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'").trim()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get('region') || 'all'

  try {
    const feedConfigs = region === 'all'
      ? Object.values(RSS_FEEDS).flat()
      : RSS_FEEDS[region] || Object.values(RSS_FEEDS).flat()

    const feedPromises = feedConfigs.map(async (config) => {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(config.url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Monitor/1.0)' },
          next: { revalidate: 300 },
        })

        clearTimeout(timeout)

        if (!response.ok) return []

        const xml = await response.text()
        return parseRSSXML(xml, config.source, config.category)
      } catch {
        return []
      }
    })

    const results = await Promise.allSettled(feedPromises)
    const allItems: FeedItem[] = results
      .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)

    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

    const grouped: Record<string, FeedItem[]> = {}
    for (const item of allItems) {
      if (!grouped[item.category]) grouped[item.category] = []
      if (grouped[item.category].length < 5) {
        grouped[item.category].push(item)
      }
    }

    return NextResponse.json({
      success: true,
      data: grouped,
      total: allItems.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news', data: {} },
      { status: 500 }
    )
  }
}
