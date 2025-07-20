"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createComment(postId: string, content: string) {
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

export async function likeComment(commentId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Not authenticated")
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .single()

  if (existingLike) {
    // Unlike
    await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id)
  } else {
    // Like
    await supabase.from("comment_likes").insert({
      comment_id: commentId,
      user_id: user.id,
    })
  }

  revalidatePath("/")
}
