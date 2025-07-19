"use server"

import { createServerClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function createPost(formData: FormData) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const type = formData.get("type") as string
  const content = formData.get("content") as string
  const videoUrl = formData.get("videoUrl") as string

  let processedVideoUrl = null
  if (type === "video" && videoUrl) {
    const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    if (videoId) processedVideoUrl = `https://www.youtube.com/embed/${videoId}`
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    type,
    content,
    video_url: processedVideoUrl,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function toggleLike(postId: string) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single()

  if (existingLike) {
    await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId)
  } else {
    await supabase.from("likes").insert({ user_id: user.id, post_id: postId })
  }

  revalidatePath("/")
}

export async function toggleBookmark(postId: string) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  // Simple bookmark toggle - you can implement this table later
  revalidatePath("/")
}

export async function deletePost(postId: string) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("posts").delete().eq("id", postId).eq("user_id", user.id)
  revalidatePath("/")
}
