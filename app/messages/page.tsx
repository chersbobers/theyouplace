"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Users } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { sendMessage } from "@/app/actions/messages"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import type { Profile } from "@/lib/types"

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  recipient_id: string
  is_read: boolean
  sender: Profile
  recipient: Profile
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchUsers, setSearchUsers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        redirect("/")
        return
      }

      setUser(user)
      await loadMessages(user.id)
      setLoading(false)
    }

    getUser()
  }, [])

  const loadMessages = async (userId: string) => {
    const supabase = createClient()

    // Get all messages for the user
    const { data: messages } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        recipient:profiles!messages_recipient_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (messages) {
      setMessages(messages)

      // Group messages into conversations
      const conversationMap = new Map()

      messages.forEach((message: any) => {
        const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id
        const otherUser = message.sender_id === userId ? message.recipient : message.sender

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            user: otherUser,
            lastMessage: message,
            unreadCount: 0,
          })
        }

        if (!message.is_read && message.recipient_id === userId) {
          conversationMap.get(otherUserId).unreadCount++
        }
      })

      setConversations(Array.from(conversationMap.values()))
    }
  }

  const searchForUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([])
      return
    }

    const supabase = createClient()
    const { data: users } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .neq("id", user.id)
      .limit(10)

    setSearchUsers(users || [])
  }

  const handleSendMessage = async (recipientId: string) => {
    if (!newMessage.trim()) return

    try {
      const recipient =
        searchUsers.find((u) => u.id === recipientId) || conversations.find((c) => c.user.id === recipientId)?.user

      if (!recipient) return

      await sendMessage(recipient.username, newMessage)
      setNewMessage("")
      setSelectedConversation(recipientId)
      await loadMessages(user.id)
      toast.success("Message sent!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send message")
    }
  }

  const getConversationMessages = (userId: string) => {
    return messages
      .filter(
        (m) =>
          (m.sender_id === user.id && m.recipient_id === userId) ||
          (m.sender_id === userId && m.recipient_id === user.id),
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          <div className="w-full h-full bg-gray-200 rounded animate-pulse" />
          <div className="md:col-span-2 w-full h-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <MessageCircle className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-500">Connect with the community</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Conversations
            </CardTitle>
            <div className="space-y-2">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchForUsers(e.target.value)
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {/* Search Results */}
            {searchQuery && searchUsers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-500">Search Results</h4>
                {searchUsers.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedConversation(searchUser.id)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={searchUser.avatar_url || ""} alt={searchUser.display_name} />
                      <AvatarFallback>{searchUser.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{searchUser.display_name}</p>
                      <p className="text-sm text-gray-500">@{searchUser.username}</p>
                    </div>
                    {searchUser.username === "chersbobers" && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">⭐</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Existing Conversations */}
            {conversations.length > 0 && (
              <div className="space-y-2">
                {searchQuery && <h4 className="text-sm font-semibold text-gray-500">Recent Conversations</h4>}
                {conversations.map((conversation) => (
                  <div
                    key={conversation.user.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.user.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedConversation(conversation.user.id)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={conversation.user.avatar_url || ""} alt={conversation.user.display_name} />
                      <AvatarFallback>{conversation.user.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold truncate">{conversation.user.display_name}</p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage.content}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {conversation.user.username === "chersbobers" && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">⭐</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {conversations.length === 0 && !searchQuery && (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400">Search for users to start chatting!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const selectedUser =
                      searchUsers.find((u) => u.id === selectedConversation) ||
                      conversations.find((c) => c.user.id === selectedConversation)?.user
                    return selectedUser ? (
                      <>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedUser.avatar_url || ""} alt={selectedUser.display_name} />
                          <AvatarFallback>{selectedUser.display_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{selectedUser.display_name}</h3>
                          <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                        </div>
                        {selectedUser.username === "chersbobers" && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            ⭐ Creator
                          </Badge>
                        )}
                      </>
                    ) : null
                  })()}
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {getConversationMessages(selectedConversation).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${message.sender_id === user.id ? "text-blue-100" : "text-gray-500"}`}
                      >
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage(selectedConversation)
                      }
                    }}
                  />
                  <Button onClick={() => handleSendMessage(selectedConversation)}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose someone to start chatting with</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
