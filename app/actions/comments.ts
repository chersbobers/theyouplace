"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createComment(postId: string, content: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}
