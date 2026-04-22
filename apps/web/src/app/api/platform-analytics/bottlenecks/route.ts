import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${API_URL}/api/platform-analytics/bottlenecks/public`,
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
    console.error('Error fetching bottlenecks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bottleneck data' },
      { status: 500 }
    );
  }
}
