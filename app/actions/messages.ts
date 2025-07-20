"use server"

import { createClient } from "@/lib/supabase-server"
import { getUser } from "@/lib/supabase-server"

export async function sendMessage(recipientId: string, content: string) {
  const user = await getUser()
  if (!user) {
    throw new Error("You must be signed in to send messages")
  }

  const supabase = await createClient()

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    content,
  })

  if (error) {
    throw new Error("Failed to send message")
  }
}

export async function getConversations() {
  const user = await getUser()
  if (!user) {
    return []
  }

  const supabase = await createClient()

  const { data: conversations } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(*),
      recipient:profiles!messages_recipient_id_fkey(*)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // Group by conversation and get latest message
  const conversationMap = new Map()

  conversations?.forEach((message) => {
    const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id
    const otherUser = message.sender_id === user.id ? message.recipient : message.sender

    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        id: otherUserId,
        other_user: otherUser,
        last_message: message.content,
        last_message_at: message.created_at,
        unread_count: 0,
      })
    }
  })

  return Array.from(conversationMap.values())
}
