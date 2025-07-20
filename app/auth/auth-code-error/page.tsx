import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home } from "lucide-react"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="retro-border bg-black/50 p-8 rounded-lg">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-pink-500 mb-4">Authentication Error</h1>
          <p className="text-pink-300 mb-6">
            There was a problem signing you in. This might be due to an expired link or a configuration issue.
          </p>
          <div className="space-y-3">
            <Link href="/auth">
              <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white">Try Again</Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full border-pink-500/30 text-pink-300 hover:bg-pink-500/10 bg-transparent"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
