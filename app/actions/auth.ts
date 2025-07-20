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

export async function signUpWithEmail(email: string, password: string, username: string, displayName?: string) {
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
        username: username,
        display_name: displayName || username,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // If user is created immediately (no email confirmation required)
  if (data.user && !data.user.email_confirmed_at) {
    // Create profile immediately for better UX
    await supabase.from("profiles").insert({
      id: data.user.id,
      username: username,
      display_name: displayName || username,
      avatar_url: "",
      bio: "",
      xp: 0,
      level: 1,
    })
  }

  redirect("/")
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    throw new Error(
      `Google OAuth Error: ${error.message}. Please ensure Google OAuth is properly configured in your Supabase project.`,
    )
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
