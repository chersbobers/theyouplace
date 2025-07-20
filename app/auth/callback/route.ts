import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        // Check if user profile exists
        const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

        if (!profile) {
          // Create profile for OAuth user
          const username = data.user.email?.split("@")[0] || `user_${data.user.id.slice(0, 8)}`

          await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            username,
            display_name: data.user.user_metadata?.full_name || username,
            avatar_url: data.user.user_metadata?.avatar_url,
          })
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error("Auth callback error:", error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
