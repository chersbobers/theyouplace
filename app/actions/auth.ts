"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string

  if (!email || !password || !username) {
    return { error: "All fields are required" }
  }

  const supabase = await createClient()

  try {
    // Check if username is already taken
    const { data: existingUser } = await supabase.from("profiles").select("username").eq("username", username).single()

    if (existingUser) {
      return { error: "Username is already taken" }
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Create profile immediately
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        display_name: username,
        bio: "",
        avatar_url: "",
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

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("Signin error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data.url) {
      redirect(data.url)
    }
  } catch (error) {
    console.error("Google signin error:", error)
    return { error: "Failed to sign in with Google" }
  }
}

export async function signOut() {
  const supabase = await createClient()

  try {
    await supabase.auth.signOut()
    revalidatePath("/")
    redirect("/auth")
  } catch (error) {
    console.error("Signout error:", error)
    return { error: "Failed to sign out" }
  }
}
