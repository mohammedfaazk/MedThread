import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeWindow = searchParams.get('timeWindow') || 'daily';
    const limit = searchParams.get('limit') || '10';
    
    const response = await fetch(
      `${API_URL}/api/health-analytics/trending?timeWindow=${timeWindow}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Don't cache real-time data
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching trending symptoms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending symptoms' },
      { status: 500 }
    );
  }
}
