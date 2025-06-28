// FILE 3: /src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    // Get count of signups
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error

    return NextResponse.json({ 
      count: count || 0, 
      message: count 
        ? `${count} skaters on the RinkBuddy waitlist! 🎉`
        : 'No signups yet - be the first!'
    })

  } catch (error) {
    console.error('Error retrieving waitlist stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Get IP address from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Insert into Supabase
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        { 
          email: cleanEmail,
          ip: ip,
          user_agent: userAgent
        }
      ])
      .select()

    if (error) {
      // Check if it's a unique constraint error (duplicate email)
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'This email is already on the waitlist! 🎯' },
          { status: 409 }
        )
      }
      
      throw error
    }

    // Get total count
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    console.log(`✅ New RinkBuddy signup: ${cleanEmail} (Total: ${count})`)

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome to RinkBuddy! 🎉',
      total: count || 0
    })

  } catch (error) {
    console.error('❌ Error processing waitlist signup:', error)
    return NextResponse.json(
      { success: false, error: 'Oops! Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}