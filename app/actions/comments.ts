"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function addComment(postId: string, content: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      content: content.trim(),
      author_id: user.id,
    })
    .select(`
      *,
      profiles:author_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .single()

  if (error) throw error

  revalidatePath("/")
  return data
}
