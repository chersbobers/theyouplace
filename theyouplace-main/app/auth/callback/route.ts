import { createServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = createServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create profile if doesn't exist
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

      if (!existingProfile) {
        const username = data.user.email?.split("@")[0] || `user_${data.user.id.slice(0, 8)}`
        await supabase.from("profiles").insert({
          id: data.user.id,
          username,
          display_name: data.user.user_metadata?.full_name || username,
          avatar_url: data.user.user_metadata?.avatar_url,
        })
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
