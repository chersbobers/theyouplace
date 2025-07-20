import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export function createServerSupabaseClient() {
  return createServerComponentClient({ cookies })
}

export async function getUser() {
  try {
    const supabase = createServerSupabaseClient()
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
