"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createPost(content: string, youtubeUrl?: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content: content.trim() || null,
      youtube_url: youtubeUrl?.trim() || null,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/")
  return data
}

export async function likePost(postId: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("post_likes").insert({
    post_id: postId,
    user_id: user.id,
  })

  if (error) throw error

  revalidatePath("/")
}

export async function unlikePost(postId: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/")
}

export async function bookmarkPost(postId: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("bookmarks").insert({
    post_id: postId,
    user_id: user.id,
  })

  if (error) throw error

  revalidatePath("/")
}

export async function unbookmarkPost(postId: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", user.id)

  if (error) throw error

  revalidatePath("/")
}
