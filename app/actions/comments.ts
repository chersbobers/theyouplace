"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createComment(formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const postId = formData.get("postId") as string
  const content = formData.get("content") as string

  const { error } = await supabase.from("comments").insert({
    user_id: user.id,
    post_id: postId,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}
