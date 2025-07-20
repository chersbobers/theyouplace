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
      // Check if profile exists
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

      if (!profile) {
        // Create profile for OAuth user
        const username = data.user.email?.split("@")[0] || `user_${data.user.id.slice(0, 8)}`
        const displayName = data.user.user_metadata?.full_name || username

        await supabase.from("profiles").insert({
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
          theme_primary_color: "#ec4899",
          theme_secondary_color: "#8b5cf6",
          theme_accent_color: "#06b6d4",
          theme_background_color: "#000000",
          theme_text_color: "#ffffff",
          profile_widgets: JSON.stringify([
            { type: "bio", enabled: true, order: 1 },
            { type: "stats", enabled: true, order: 2 },
            { type: "recent_posts", enabled: true, order: 3 },
            { type: "social_links", enabled: false, order: 4 },
          ]),
          social_links: JSON.stringify({}),
        })

        // Give special badge to chersbobers
        if (username === "chersbobers") {
          await supabase.from("user_badges").insert({
            user_id: data.user.id,
            badge_id: "creator-badge",
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
