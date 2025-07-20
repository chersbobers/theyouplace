"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>There was a problem signing you in to The You Place</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Possible causes:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Google OAuth is not enabled in Supabase</li>
              <li>Invalid redirect URL configuration</li>
              <li>Network connection issues</li>
              <li>Expired or invalid authentication code</li>
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg text-sm">
            <p>
              <strong>For administrators:</strong>
            </p>
            <p>
              Make sure Google OAuth is properly configured in your Supabase project settings with the correct redirect
              URLs.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
