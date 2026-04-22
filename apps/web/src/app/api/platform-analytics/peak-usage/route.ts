import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days') || '30';
    
    const response = await fetch(
      `${API_URL}/api/platform-analytics/peak-usage/public?days=${days}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching peak usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch peak usage data' },
      { status: 500 }
    );
  }
}
