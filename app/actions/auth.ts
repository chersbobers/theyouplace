"use server"

import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(formData: FormData) {
  const supabase = createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string
  const displayName = formData.get("displayName") as string

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    // Create profile with default customization
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
      display_name: displayName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      theme_primary_color: "#3b82f6",
      theme_secondary_color: "#1e40af",
      theme_accent_color: "#f59e0b",
      theme_background_color: "#ffffff",
      theme_text_color: "#1f2937",
      layout_style: "modern",
      profile_widgets: JSON.stringify([
        { type: "bio", enabled: true, order: 1 },
        { type: "stats", enabled: true, order: 2 },
        { type: "recent_posts", enabled: true, order: 3 },
        { type: "social_links", enabled: true, order: 4 },
      ]),
      social_links: JSON.stringify({}),
    })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath("/")
  redirect("/")
}

export async function signIn(formData: FormData) {
  const supabase = createServerClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  redirect("/")
}

export async function signInWithGoogle() {
  const supabase = createServerClient()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/")
}
