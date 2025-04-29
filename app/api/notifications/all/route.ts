import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Call the backend API
    const response = await fetch('http://localhost:8005/api/notifications/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the data from our API route
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications', error: (error as Error).message },
      { status: 500 }
    );
  }
} 