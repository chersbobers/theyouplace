"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createPost(data: {
  content: string
  youtube_url?: string | null
  author_id: string
}) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("posts").insert([
      {
        content: data.content,
        youtube_url: data.youtube_url,
        author_id: data.author_id,
      },
    ])

    if (error) {
      console.error("Error creating post:", error)
      throw new Error("Failed to create post")
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error in createPost:", error)
    throw error
  }
}

export async function likePost(postId: string) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()

    if (!user.data.user) {
      throw new Error("Not authenticated")
    }

    const { error } = await supabase.from("post_likes").insert([
      {
        post_id: postId,
        user_id: user.data.user.id,
      },
    ])

    if (error && error.code !== "23505") {
      // Ignore duplicate key error
      throw error
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error liking post:", error)
    throw error
  }
}

export async function unlikePost(postId: string) {
  try {
    const supabase = await createClient()
    const user = await supabase.auth.getUser()

    if (!user.data.user) {
      throw new Error("Not authenticated")
    }

    const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.data.user.id)

    if (error) {
      throw error
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error unliking post:", error)
    throw error
  }
}
