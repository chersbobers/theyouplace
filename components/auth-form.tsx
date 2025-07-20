"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signUp, signIn, signInWithGoogle } from "@/app/actions/auth"
import { Loader2, Mail, Lock, User, Sparkles } from "lucide-react"

export function AuthForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (formData: FormData, action: "signin" | "signup") => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = action === "signin" ? await signIn(formData) : await signUp(formData)

      if (result?.error) {
        setError(result.error)
      } else if (action === "signup") {
        setSuccess("Check your email to confirm your account!")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      const result = await signInWithGoogle()
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="retro-border bg-black/80 border-pink-500/30">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Sparkles className="h-8 w-8 text-pink-500" />
        </div>
        <CardTitle className="text-2xl neon-text text-pink-500">Join The You Place</CardTitle>
        <CardDescription className="text-pink-300">Create your account or sign in to get started</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-500/50 bg-red-500/10">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500/50 bg-green-500/10">
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-100 text-black border-2 border-pink-500"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-pink-500/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-pink-400">Or continue with email</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-pink-500/30">
              <TabsTrigger
                value="signin"
                className="text-pink-300 data-[state=active]:bg-pink-500 data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-pink-300 data-[state=active]:bg-pink-500 data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form action={(formData) => handleSubmit(formData, "signin")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-pink-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="pl-10 bg-black/50 border-pink-500/30 text-white placeholder:text-pink-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-pink-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="pl-10 bg-black/50 border-pink-500/30 text-white placeholder:text-pink-400"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form action={(formData) => handleSubmit(formData, "signup")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-pink-300">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                    <Input
                      id="signup-username"
                      name="username"
                      type="text"
                      placeholder="cooluser123"
                      required
                      className="pl-10 bg-black/50 border-pink-500/30 text-white placeholder:text-pink-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-pink-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      className="pl-10 bg-black/50 border-pink-500/30 text-white placeholder:text-pink-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-pink-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="pl-10 bg-black/50 border-pink-500/30 text-white placeholder:text-pink-400"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
