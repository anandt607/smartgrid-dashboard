import { NextResponse } from 'next/server'

/**
 * Example API route
 * GET /api/hello
 */
export async function GET() {
  return NextResponse.json({
    message: 'Hello from SmartGrid API!',
    timestamp: new Date().toISOString(),
    status: 'success',
  })
}

/**
 * Example POST endpoint
 * POST /api/hello
 */
export async function POST(request) {
  const body = await request.json()
  
  return NextResponse.json({
    message: 'Data received',
    data: body,
    timestamp: new Date().toISOString(),
  })
}
