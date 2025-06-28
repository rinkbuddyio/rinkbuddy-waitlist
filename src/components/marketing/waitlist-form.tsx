// FILE 2: /src/components/marketing/waitlist-form.tsx
"use client"

import { useState } from "react"

export default function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Welcome to RinkBuddy! 🎉")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-12 max-w-lg w-full shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RinkBuddy.io</h1>
          <div className="text-sm text-gray-500 font-medium mb-6">SINCE 2025</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Where toe picks meet tech
          </h2>
          <p className="text-gray-600">
            The analytics platform built by figure skaters, for figure skaters.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={status === "loading"}
          />
          
          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="w-full bg-gray-900 text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Joining..." : "Join Waitlist"}
          </button>
        </form>
        
        {status === "success" && (
          <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
        )}
        
        {status === "error" && (
          <p className="mt-4 text-center text-red-600">{message}</p>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Join 500+ skaters, coaches, and skating parents
          </p>
          <p className="text-xs text-gray-400">
            Finally, an app that knows a combo jump isn&apos;t a sandwich
          </p>
        </div>
      </div>
    </div>
  )
}