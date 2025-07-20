"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createPost(content: string, youtubeUrl?: string | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content,
    youtube_url: youtubeUrl,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/")
}

export async function likePost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

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
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/")
}
