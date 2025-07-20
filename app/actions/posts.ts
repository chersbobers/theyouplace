"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createPost(formData: FormData) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a post" }
    }

    const content = formData.get("content") as string
    const videoUrl = formData.get("video_url") as string

    if (!content?.trim()) {
      return { error: "Content is required" }
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content.trim(),
        video_url: videoUrl || null,
      })
      .select(`
        *,
        user:users(*)
      `)
      .single()

    if (error) {
      return { error: "Failed to create post" }
    }

    revalidatePath("/")
    return { success: true, post }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}

export async function likePost(postId: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to like posts" }
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single()

    if (existingLike) {
      // Unlike the post
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id)
    } else {
      // Like the post
      await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: user.id,
      })
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { error: "An unexpected error occurred" }
  }
}
