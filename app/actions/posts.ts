"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createPost(formData: FormData) {
  const content = formData.get("content") as string
  const youtubeUrl = formData.get("youtubeUrl") as string

  if (!content && !youtubeUrl) {
    return { error: "Content or YouTube URL is required" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a post" }
  }

  try {
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content || "",
      youtube_url: youtubeUrl || null,
      media_type: youtubeUrl ? "youtube" : "text",
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Create post error:", error)
    return { error: "Failed to create post" }
  }
}

export async function likePost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to like a post" }
  }

  try {
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
  } catch (error) {
    console.error("Like post error:", error)
    return { error: "Failed to like post" }
  }
}
