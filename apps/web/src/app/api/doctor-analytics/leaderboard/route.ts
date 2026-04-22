import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '10';
    const sortBy = searchParams.get('sortBy') || 'helpfulnessScore';
    
    const response = await fetch(
      `${API_URL}/api/doctor-analytics/leaderboard?limit=${limit}&sortBy=${sortBy}`,
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
    console.error('Error fetching doctor leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctor leaderboard' },
      { status: 500 }
    );
  }
}
