"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signInWithGoogle, signOut } from "@/app/actions/auth"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AuthForm() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === "SIGNED_IN") {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return <Button disabled>Loading...</Button>
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">Welcome, {user.user_metadata?.full_name || user.email}</span>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
      Sign in with Google
    </Button>
  )
}
