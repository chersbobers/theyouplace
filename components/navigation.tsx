"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Home, Users, MessageCircle, User, Settings, LogOut, Play } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { AuthForm } from "@/components/auth-form"
import { useState } from "react"

interface NavigationProps {
  user: any
}

export function Navigation({ user }: NavigationProps) {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                The You Place
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link
                href="/users"
                className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Community</span>
              </Link>
              {user && (
                <>
                  <Link
                    href="/messages"
                    className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Messages</span>
                  </Link>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user.profile?.avatar_url || "/placeholder.svg"}
                          alt={user.profile?.display_name}
                        />
                        <AvatarFallback>{user.profile?.display_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      {user.profile?.level > 1 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                          {user.profile.level}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.profile?.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{user.profile?.username}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Level {user.profile?.level || 1}</span>
                          <span>•</span>
                          <span>{user.profile?.xp || 0} XP</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.profile?.username}`} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/customize" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Customize</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" onClick={() => setShowAuth(true)}>
                    Sign In
                  </Button>
                  <Button onClick={() => setShowAuth(true)}>Join The You Place</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuth && !user && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Welcome to The You Place</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAuth(false)}>
                ✕
              </Button>
            </div>
            <AuthForm onSuccess={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </>
  )
}
