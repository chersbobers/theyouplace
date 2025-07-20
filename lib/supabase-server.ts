import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase environment variables")
    return createClient("https://placeholder.supabase.co", "placeholder-key")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function getUser() {
  try {
    const supabase = createServerClient()
    const cookieStore = await cookies()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return {
      ...user,
      profile: profile || {
        id: user.id,
        username: user.email?.split("@")[0] || "user",
        display_name: user.user_metadata?.full_name || "Anonymous",
        bio: "",
        avatar_url: user.user_metadata?.avatar_url || "",
        xp: 0,
        level: 1,
        created_at: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}
