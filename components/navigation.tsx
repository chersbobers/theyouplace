"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, Users, MessageCircle, Settings, LogOut, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { UserProfile } from "@/lib/types"

export function Navigation() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

          setUser(profile)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        setUser(profile)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <nav className="border-b border-pink-500/20 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-pink-500/20 rounded animate-pulse" />
            <div className="h-8 w-20 bg-pink-500/20 rounded animate-pulse" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b border-pink-500/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-pink-500" />
            <span className="myspace-title text-2xl neon-text text-pink-500">THE YOU PLACE</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-pink-300 hover:text-pink-500">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link href="/users">
                  <Button variant="ghost" size="sm" className="text-pink-300 hover:text-pink-500">
                    <Users className="h-4 w-4 mr-2" />
                    Community
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="sm" className="text-pink-300 hover:text-pink-500">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full retro-border">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ""} alt={user.display_name || user.username} />
                        <AvatarFallback className="bg-pink-500 text-white">
                          {(user.display_name || user.username).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black/90 border-pink-500/20" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.username}`} className="flex items-center text-pink-300">
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center text-pink-300">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/customize" className="flex items-center text-pink-300">
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Customize</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-pink-300">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white retro-border">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
