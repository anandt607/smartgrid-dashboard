/**
 * POST /api/teamgrid/users/create
 * 
 * Create TeamGrid-specific user data in MongoDB
 * Called AFTER creating user in Supabase
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// MongoDB connection
const MONGODB_URI = process.env.TEAMGRID_MONGODB_URI
let cachedClient = null

async function connectToMongoDB() {
  if (cachedClient) {
    return cachedClient
  }
  
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  cachedClient = client
  return client
}

// Create client for user session
function createSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {},
        remove(name, options) {},
      },
    }
  )
}

export async function POST(request) {
  try {
    const origin = request.headers.get('origin')
    
    // Check for Grid Apps API secret (for cross-origin calls from TeamGrid, etc.)
    const authHeader = request.headers.get('authorization')
    const gridAppsSecret = process.env.GRID_APPS_API_SECRET
    
    let isAuthenticated = false
    let user = null

    // Option 1: Check for Grid Apps API secret
    if (authHeader && authHeader.startsWith('Bearer ') && gridAppsSecret) {
      const token = authHeader.replace('Bearer ', '')
      if (token === gridAppsSecret) {
        console.log('✅ Authenticated via Grid Apps API secret')
        isAuthenticated = true
        // For cross-origin calls, we won't have a specific user
        // The user data will be provided in the request body
      }
    }

    // Option 2: Check session (for SmartGrid Dashboard calls)
    if (!isAuthenticated) {
      const supabase = createSupabaseClient()
      const { data: { user: sessionUser }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && sessionUser) {
        console.log('✅ Authenticated via session:', sessionUser.email)
        isAuthenticated = true
        user = sessionUser
      }
    }

    // If neither auth method worked, return 401
    if (!isAuthenticated) {
      console.log('❌ Authentication failed - no valid session or API secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      supabase_user_id,
      supabase_org_id,
      firstName,
      lastName,
      email,
      role = 'org_user',
      position = '',
      phone = '',
      department = '',
      reportingManager = null,
      reportingManagers = [],
      billingEnabled = true,
      permissions = {
        addProject: false,
        addTeamMember: false,
        viewReports: true,
        viewActivity: true,
        editProfile: true
      }
    } = body

    // Validate required fields
    if (!supabase_user_id || !supabase_org_id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: supabase_user_id, supabase_org_id, email' },
        { status: 400 }
      )
    }

    console.log(`📝 Creating TeamGrid user for ${email}`)

    // Connect to MongoDB
    const client = await connectToMongoDB()
    const db = client.db('test') // Your TeamGrid database
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      _id: supabase_user_id 
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'TeamGrid user already exists' },
        { status: 400 }
      )
    }

    // Create TeamGrid user document
    const teamGridUser = {
      _id: supabase_user_id, // Use Supabase UUID as _id
      email,
      firstName,
      lastName,
      organizationId: supabase_org_id, // Link to Supabase org
      
      // TeamGrid specific fields
      role,
      position,
      phone,
      department,
      reportingManager,
      reportingManagers,
      billingEnabled,
      isBillable: billingEnabled,
      permissions,
      
      // Default settings
      timezone: 'UTC',
      language: 'en',
      currency: 'USD',
      
      // Consent settings (default all false)
      consentSettings: {
        screenshotCapture: false,
        activityTracking: false,
        webcamAttendance: false,
        gpsTracking: false
      },
      
      // Preferences
      preferences: {
        notifications: {
          email: true,
          push: true,
          inApp: true
        },
        dashboard: {
          defaultView: 'timeline',
          showStats: true
        },
        privacy: {
          shareActivity: false,
          publicProfile: false
        }
      },
      
      // Hierarchy (will be calculated)
      hasSubordinates: false,
      hierarchyLevel: reportingManager ? 2 : 1,
      subordinateCount: 0,
      
      // Status
      status: 'active',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    }

    // Insert user into MongoDB
    const result = await usersCollection.insertOne(teamGridUser)

    console.log(`✅ TeamGrid user created: ${result.insertedId}`)

    return NextResponse.json({
      success: true,
      message: 'TeamGrid user created successfully',
      user: {
        id: result.insertedId,
        email,
        firstName,
        lastName,
        role,
        organizationId: supabase_org_id
      }
    })

  } catch (error) {
    console.error('❌ Error creating TeamGrid user:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

