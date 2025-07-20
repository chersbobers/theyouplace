"use server"

import { createClient } from "@/lib/supabase-server"
import { getUser } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createPost(content: string, youtubeUrl?: string) {
  const user = await getUser()

  if (!user) {
    throw new Error("You must be logged in to create a post")
  }

  const supabase = await createClient()

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    content,
    youtube_url: youtubeUrl,
    likes_count: 0,
    comments_count: 0,
    shares_count: 0,
  })

  if (error) {
    throw new Error("Failed to create post")
  }

  // Update user's post count
  await supabase.rpc("increment_posts_count", { user_id: user.id })

  revalidatePath("/")
}

export async function likePost(postId: string) {
  const user = await getUser()

  if (!user) {
    throw new Error("You must be logged in to like a post")
  }

  const supabase = await createClient()

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

    await supabase.rpc("decrement_likes_count", { post_id: postId })
  } else {
    // Like
    await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id })

    await supabase.rpc("increment_likes_count", { post_id: postId })
  }

  revalidatePath("/")
}
