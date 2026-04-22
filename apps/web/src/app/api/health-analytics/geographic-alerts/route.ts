import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region');
    
    const url = region 
      ? `${API_URL}/api/health-analytics/geographic-alerts?region=${region}`
      : `${API_URL}/api/health-analytics/geographic-alerts`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache real-time data
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching geographic alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch geographic alerts' },
      { status: 500 }
    );
  }
}
