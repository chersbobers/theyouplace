"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createPost(content: string, youtubeUrl?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content: content.trim() || null,
    youtube_url: youtubeUrl?.trim() || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function likePost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single()

  if (existingLike) {
    // Unlike
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id)
  } else {
    // Like
    await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: user.id,
    })
  }

  revalidatePath("/")
  return { success: true }
}

export async function unlikePost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/")
}

export async function bookmarkPost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  // Check if already bookmarked
  const { data: existingBookmark } = await supabase
    .from("post_bookmarks")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single()

  if (existingBookmark) {
    // Remove bookmark
    await supabase.from("post_bookmarks").delete().eq("post_id", postId).eq("user_id", user.id)
  } else {
    // Add bookmark
    await supabase.from("post_bookmarks").insert({
      post_id: postId,
      user_id: user.id,
    })
  }

  revalidatePath("/")
  return { success: true }
}

export async function unbookmarkPost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("post_bookmarks").delete().eq("post_id", postId).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/")
}
