// FILE 3: /src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface WaitlistEntry {
  id: string
  email: string
  timestamp: string
  ip: string
  userAgent: string
}

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
    const data: WaitlistEntry[] = JSON.parse(fileContent)

    return NextResponse.json({ 
      count: data.length,
      message: `${data.length} skaters on the RinkBuddy waitlist! 🎉`
    })

  } catch {
    console.error('Error retrieving waitlist stats')
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

    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    const waitlistEntry: WaitlistEntry = {
      id: Date.now().toString(),
      email: cleanEmail,
      timestamp: new Date().toISOString(),
      ip: ip,
      userAgent: request.headers.get('user-agent') || 'unknown'
    }

    const dataDir = path.join(process.cwd(), 'data')

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const filePath = path.join(dataDir, 'waitlist.json')

    let existingData: WaitlistEntry[] = []
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8')
        existingData = JSON.parse(fileContent)
      } catch {
        console.error('Error parsing existing data')
        existingData = []
      }
    }

    const emailExists = existingData.some((entry) => entry.email === cleanEmail)
    if (emailExists) {
      return NextResponse.json(
        { success: false, error: 'This email is already on the waitlist! 🎯' },
        { status: 409 }
      )
    }

    existingData.push(waitlistEntry)

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2))

    console.log(`✅ New RinkBuddy signup: ${cleanEmail} (Total: ${existingData.length})`)

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome to RinkBuddy! 🎉',
      total: existingData.length
    })

  } catch {
    console.error('❌ Error processing waitlist signup')
    return NextResponse.json(
      { success: false, error: 'Oops! Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}