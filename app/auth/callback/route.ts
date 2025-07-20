import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists, if not create one
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

      if (!existingProfile) {
        // Generate username from email or use a default
        const username = data.user.email?.split("@")[0] || `user_${data.user.id.slice(0, 8)}`
        const displayName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || username

        // Create profile for OAuth users
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username,
          display_name: displayName,
          bio: "",
          avatar_url: data.user.user_metadata?.avatar_url || "",
          xp: 0,
          level: 1,
          posts_count: 0,
          followers_count: 0,
          following_count: 0,
          is_profile_public: true,
          theme_primary_color: "#3b82f6",
          theme_secondary_color: "#1d4ed8",
          theme_accent_color: "#60a5fa",
          theme_background_color: "#ffffff",
          theme_text_color: "#111827",
          profile_widgets: [
            { type: "bio", enabled: true, order: 1 },
            { type: "stats", enabled: true, order: 2 },
            { type: "recent_posts", enabled: true, order: 3 },
            { type: "social_links", enabled: false, order: 4 },
          ],
          social_links: {},
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }

        // Give special badge to chersbobers
        if (username === "chersbobers") {
          await supabase.from("user_badges").insert({
            user_id: data.user.id,
            badge_id: "creator-badge",
          })
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
