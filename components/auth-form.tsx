"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { signInWithGoogle } from "@/app/actions/auth"
import { LogIn, Chrome } from "lucide-react"

export function AuthForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signInWithGoogle()
    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to YouPlace!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center text-sm text-muted-foreground">
            Join our community to share videos, connect with others, and earn XP!
          </div>
          <Button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full" size="lg">
            <Chrome className="w-5 h-5 mr-2" />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
