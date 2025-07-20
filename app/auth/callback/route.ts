import { createServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create or update profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        username: data.user.email?.split("@")[0] || "user",
        display_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
        avatar_url: data.user.user_metadata?.avatar_url || "",
        email: data.user.email,
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
