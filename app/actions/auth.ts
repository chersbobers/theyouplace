"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect("/")
}

export async function signUpWithEmail(email: string, password: string, username: string, displayName: string) {
  const supabase = await createClient()

  // Check if username is already taken
  const { data: existingUser } = await supabase.from("profiles").select("username").eq("username", username).single()

  if (existingUser) {
    throw new Error("Username is already taken")
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.user) {
    // Create profile immediately
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
      throw new Error("Failed to create profile")
    }

    // Give special badge to chersbobers
    if (username === "chersbobers") {
      await supabase.from("user_badges").insert({
        user_id: data.user.id,
        badge_id: "creator-badge",
      })
    }
  }

  redirect("/")
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/")
}
