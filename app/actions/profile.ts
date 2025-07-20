"use server"

import { createClient } from "@/lib/supabase-server"
import { getUser } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: {
  username: string
  display_name: string
  bio: string
  avatar_url: string
}) {
  const user = await getUser()
  if (!user) {
    throw new Error("You must be signed in to update your profile")
  }

  const supabase = await createClient()

  // Check if username is already taken (if changed)
  if (data.username !== user.profile?.username) {
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", data.username)
      .neq("id", user.id)
      .single()

    if (existingUser) {
      throw new Error("Username is already taken")
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: data.username,
      display_name: data.display_name,
      bio: data.bio,
      avatar_url: data.avatar_url,
    })
    .eq("id", user.id)

  if (error) {
    throw new Error("Failed to update profile")
  }

  revalidatePath("/settings")
  revalidatePath(`/profile/${data.username}`)
}

export async function updateProfileCustomization(data: {
  theme_primary_color: string
  theme_secondary_color: string
  theme_accent_color: string
  theme_background_color: string
  theme_text_color: string
  banner_image: string
  background_image: string
  profile_music: string
  custom_css: string
  social_links: Record<string, string>
  profile_widgets: Array<{ type: string; enabled: boolean; order: number }>
}) {
  const user = await getUser()
  if (!user) {
    throw new Error("You must be signed in to customize your profile")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      theme_primary_color: data.theme_primary_color,
      theme_secondary_color: data.theme_secondary_color,
      theme_accent_color: data.theme_accent_color,
      theme_background_color: data.theme_background_color,
      theme_text_color: data.theme_text_color,
      banner_image: data.banner_image,
      background_image: data.background_image,
      profile_music: data.profile_music,
      custom_css: data.custom_css,
      social_links: JSON.stringify(data.social_links),
      profile_widgets: JSON.stringify(data.profile_widgets),
    })
    .eq("id", user.id)

  if (error) {
    throw new Error("Failed to update profile customization")
  }

  revalidatePath("/customize")
  revalidatePath(`/profile/${user.profile?.username}`)
}
