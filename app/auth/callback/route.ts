import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create or update user profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        username:
          data.user.user_metadata?.preferred_username ||
          data.user.email?.split("@")[0] ||
          `user_${data.user.id.slice(0, 8)}`,
        display_name: data.user.user_metadata?.full_name || data.user.email,
        avatar_url: data.user.user_metadata?.avatar_url,
        email: data.user.email,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
      }
    }
  }

  return NextResponse.redirect(new URL("/", request.url))
}
