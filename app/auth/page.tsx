import { AuthForm } from "@/components/auth-form"
import { Sparkles } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-16 w-16 text-pink-500 neon-text" />
          </div>
          <h1 className="myspace-title text-4xl font-bold neon-text text-pink-500 mb-2">THE YOU PLACE</h1>
          <p className="text-pink-300 text-lg retro-font">✨ Your Digital Space Awaits ✨</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
