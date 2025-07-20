import { createClient } from "@/lib/supabase-server"
import { MessagesList } from "@/components/messages-list"
import { ChatWindow } from "@/components/chat-window"
import { redirect } from "next/navigation"

export default async function MessagesPage({ searchParams }: { searchParams: { user?: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Get user's conversations
  const { data: conversations = [] } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url),
      recipient:profiles!messages_recipient_id_fkey(id, username, display_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // Get unique conversation partners
  const partners = new Map()
  conversations.forEach((msg) => {
    const partner = msg.sender_id === user.id ? msg.recipient : msg.sender
    if (!partners.has(partner.id)) {
      partners.set(partner.id, {
        ...partner,
        lastMessage: msg.content,
        lastMessageTime: msg.created_at,
      })
    }
  })

  const conversationPartners = Array.from(partners.values())

  // If user parameter is provided, get that user's info
  let selectedUser = null
  if (searchParams.user) {
    const { data: userData } = await supabase.from("profiles").select("*").eq("username", searchParams.user).single()
    selectedUser = userData
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <div className="w-1/3 border-r">
          <MessagesList conversations={conversationPartners} currentUserId={user.id} />
        </div>
        <div className="flex-1">
          {selectedUser ? (
            <ChatWindow recipient={selectedUser} currentUserId={user.id} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
