import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    const filePath = path.join(dataDir, 'waitlist.json')

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ 
        count: 0, 
        message: 'No signups yet - be the first!' 
      })
    }

    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)

    return NextResponse.json({ 
      count: data.length,
      message: `${data.length} skaters on the RinkBuddy waitlist! 🎉`
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

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Clean email
    const cleanEmail = email.toLowerCase().trim()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Create waitlist entry
    const waitlistEntry = {
      id: Date.now().toString(),
      email: cleanEmail,
      timestamp: new Date().toISOString(),
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }

    // Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

    const filePath = path.join(dataDir, 'waitlist.json')

    // Read existing data or create empty array
    let existingData = []
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        existingData = JSON.parse(fileContent)
      } catch (parseError) {
        console.error('Error parsing existing data:', parseError)
        existingData = []
      }
    }

    // Check if email already exists
    const emailExists = existingData.some((entry: any) => entry.email === cleanEmail)
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'This email is already on the waitlist! 🎯' },
        { status: 409 }
      )
    }

    // Add new entry
    existingData.push(waitlistEntry)

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2))

    // Log success
    console.log(`✅ New RinkBuddy signup: ${cleanEmail} (Total: ${existingData.length})`)

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome to RinkBuddy! 🎉',
      total: existingData.length
    })

  } catch (error) {
    console.error('❌ Error processing waitlist signup:', error)
    return NextResponse.json(
      { success: false, error: 'Oops! Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}