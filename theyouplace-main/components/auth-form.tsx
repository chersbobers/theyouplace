"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { signIn, signUp, signInWithGoogle } from "@/app/actions/auth"
import { Video, Chrome } from "lucide-react"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData, action: "signin" | "signup") => {
    setIsLoading(true)
    try {
      if (action === "signin") {
        await signIn(formData)
      } else {
        await signUp(formData)
      }
    } catch (error) {
      console.error("Auth error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Google sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">VidSocial</h1>
          </div>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign In */}
          <form action={handleGoogleSignIn}>
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 transition-all duration-200 bg-transparent"
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="signin" className="text-base">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-base">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <form action={(formData) => handleSubmit(formData, "signin")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form action={(formData) => handleSubmit(formData, "signup")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-displayName">Display Name</Label>
                  <Input
                    id="signup-displayName"
                    name="displayName"
                    type="text"
                    placeholder="Your display name"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    required
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground">
            <p>Join thousands of creators building their unique profiles</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
