"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/app/actions/auth"
import { Chrome, Mail, Lock } from "lucide-react"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) return

    setIsLoading(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (error) {
      console.error("Auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Google auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Google Sign In */}
      <Button onClick={handleGoogleAuth} disabled={isLoading} className="w-full gap-2 bg-transparent" variant="outline">
        <Chrome className="w-4 h-4" />
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* Email/Password Auth */}
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signin-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={() => handleEmailAuth(false)} disabled={isLoading || !email || !password} className="w-full">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={() => handleEmailAuth(true)} disabled={isLoading || !email || !password} className="w-full">
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
