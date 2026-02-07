import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 50)

    const res = await fetch(`http://localhost:8001/api/v1/analysis/?limit=${limit}`)
    
    if (!res.ok) {
         // Fallback to empty if backend fails or is empty
         return NextResponse.json({ analyses: [] })
    }

    const data = await res.json()

    // Map Python Snake Case to Frontend Camel Case / Prisma Schema
    const analyses = data.map((item: any) => ({
        id: item.id,
        riskLevel: item.risk_level,
        volumeEstimateM3: item.volume_change,
        // Frontend expects path to image for display.
        // Backend stores absolute path or relative?
        // We probably need to serve them via /static/
        ndwiImagePath: item.ndwi_path_1 ? `/static/${item.ndwi_path_1.split('\\').pop().split('/').pop()}` : null,
        createdAt: item.created_at,
        // Mocking other fields if missing
        accuracy: 90,
        changePercentage: 0,
        image: {
            type: 'satellite',
            filePath: '/placeholder.svg' 
        }
    }))

    return NextResponse.json({ analyses })
  } catch (e: any) {
    console.error('Latest analyses fetch error', e)
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
