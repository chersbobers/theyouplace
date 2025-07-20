"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function sendMessage(recipientUsername: string, content: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Get recipient user ID
  const { data: recipient } = await supabase.from("profiles").select("id").eq("username", recipientUsername).single()

  if (!recipient) {
    return { error: "User not found" }
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: recipient.id,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/messages")
  return { success: true }
}
