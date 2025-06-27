"use client"

import { useRef, useState, useEffect } from "react"
import clsx from "clsx"

type State = "idle" | "loading" | "success" | "error"

const STATES: Record<State, State> = {
  idle: "idle",
  loading: "loading", 
  success: "success",
  error: "error",
}

const Loading = () => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded-full border border-[currentColor] !border-t-[transparent] animate-spin" />
  </div>
)

export function WaitlistForm() {
  const [state, setState] = useState<State>(STATES.idle)
  const [error, setError] = useState<string>()
  const [value, setValue] = useState("")
  const [activeTab, setActiveTab] = useState<'waitlist' | 'manifesto'>('waitlist')
  const errorTimeout = useRef<NodeJS.Timeout | null>(null)

  // Auto-reset success state back to idle after 2 seconds
  useEffect(() => {
    if (state === STATES.success) {
      const resetTimeout = setTimeout(() => {
        setState(STATES.idle)
      }, 2000)

      return () => clearTimeout(resetTimeout)
    }
  }, [state])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    if (state === STATES.success || state === STATES.loading) return
    
    if (errorTimeout.current) {
      clearTimeout(errorTimeout.current)
      setError(undefined)
      setState(STATES.idle)
    }

    try {
      setState(STATES.loading)
      
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: value }),
      })

      if (response.ok) {
        setState(STATES.success)
        formEl.reset()
        setValue("")
      } else {
        const data = await response.json()
        setState(STATES.error)
        setError(data.error || "There was an error submitting the form")
        errorTimeout.current = setTimeout(() => {
          setError(undefined)
          setState(STATES.idle)
        }, 3000)
      }
    } catch (error) {
      setState(STATES.error)
      setError("There was an error while submitting the form")
      console.error(error)
      errorTimeout.current = setTimeout(() => {
        setError(undefined)
        setState(STATES.idle)
      }, 3000)
    }
  }

  const isSubmitted = state === "success"
  const inputDisabled = state === "loading"

  const buttonCopy = {
    idle: "Join waitlist",
    loading: "Joining...",
    success: "Welcome! 🎉"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      
      {/* Setup Button */}
      <div className="absolute top-6 right-6">
        <div className="bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Early Access
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 flex">
          <button 
            onClick={() => setActiveTab('waitlist')}
            className={clsx(
              "px-6 py-2 rounded-full font-medium text-sm transition-all duration-200",
              activeTab === 'waitlist' 
                ? "bg-white shadow-sm text-gray-900" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Waitlist
          </button>
          <button 
            onClick={() => setActiveTab('manifesto')}
            className={clsx(
              "px-6 py-2 rounded-full font-medium text-sm transition-all duration-200",
              activeTab === 'manifesto' 
                ? "bg-white shadow-sm text-gray-900" 
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Manifesto
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 max-w-lg w-full mx-auto shadow-2xl relative z-10">
        
        {/* Waitlist Tab */}
        {activeTab === 'waitlist' && (
          <>
            {/* Branding */}
            <div className="text-center mb-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">RinkBuddy.io</h1>
                <div className="text-sm text-gray-500 font-medium">SINCE 2025</div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                Where toe picks meet tech
              </h2>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                We read the rulebook so you could focus on the skating. The analytics platform built by figure skaters, for figure skaters.
              </p>
            </div>

            {/* Waitlist Form */}
            <form className="flex flex-col gap-2 w-full relative" onSubmit={handleSubmit}>
              <div className="flex items-center justify-between gap-3 relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={value}
                  className={clsx(
                    "flex-1 text-sm pl-4 pr-28 py-2 h-11 bg-gray-100/80 cursor-text rounded-full text-gray-900 placeholder:text-gray-500 border border-gray-200/50 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200",
                  )}
                  disabled={inputDisabled}
                  onChange={(e) => setValue(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={inputDisabled || !value.trim()}
                  className={clsx(
                    "absolute h-8 px-3.5 bg-gray-900 text-white text-sm top-1/2 transform -translate-y-1/2 right-1.5 rounded-full font-medium flex gap-1 items-center transition-all duration-200 hover:bg-gray-800",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    {
                      "bg-gray-700": state === "loading",
                      "bg-blue-600 hover:bg-blue-600": state === "success",
                    },
                  )}
                >
                  {state === "loading" ? (
                    <>
                      {buttonCopy.loading}
                      <Loading />
                    </>
                  ) : isSubmitted ? (
                    buttonCopy.success
                  ) : (
                    buttonCopy.idle
                  )}
                </button>
              </div>
              <div className="w-full h-2" />
              {error && (
                <p className="absolute text-xs text-red-500 top-full -translate-y-1/2 px-2">
                  {error}
                </p>
              )}
            </form>

            {/* Social Proof */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Join 500+ skaters, coaches, and skating parents
              </p>
             <p className="text-xs text-gray-400">
  Finally, an app that knows a combo jump isn&apos;t a sandwich
</p>
            </div>
          </>
        )}

        {/* Manifesto Tab */}
        {activeTab === 'manifesto' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">RinkBuddy.io</h2>
                <div className="text-sm text-gray-500 font-medium">SINCE 2025</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                You already do everything.<br />Now you can prove it.
              </h3>
              <p className="text-gray-600 text-sm">
                Built for the skaters who read the rules, then rewrote the routine.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm">🤖</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">AI-Powered Protocol Analysis</h4>
                  <p className="text-xs text-gray-600 mt-1">Upload your protocols and get instant insights. We know what a combo jump actually is.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm">📊</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Performance Analytics</h4>
                  <p className="text-xs text-gray-600 mt-1">Track your progress across competitions. Because sticky notes aren&apos;t a system.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm">🎯</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">USFSA Rule Integration</h4>
                 <p className="text-xs text-gray-600 mt-1">We memorized the rulebook so you don&apos;t have to. Focus on the skating.</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm">📱</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Mobile-First Design</h4>
                  <p className="text-xs text-gray-600 mt-1">Upload protocols directly from competitions. No more group texts and vibes.</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-gray-100">
              <button 
                onClick={() => setActiveTab('waitlist')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to waitlist
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Follow RinkBuddy.io on{" "}
            <a href="#" className="text-gray-700 hover:text-blue-600 underline">
              Twitter
            </a>{" "}
            and{" "}
            <a href="#" className="text-gray-700 hover:text-blue-600 underline">
              Discord
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}