"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Search, Users } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { sendMessage, getConversations } from "@/app/actions/messages"
import { toast } from "sonner"
import Link from "next/link"
import type { Profile } from "@/lib/types"

interface Conversation {
  id: string
  other_user: Profile
  last_message: string
  last_message_at: string
  unread_count: number
}

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender: Profile
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])

  useEffect(() => {
    const supabase = createClient()

    const initializeMessages = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCurrentUser(user)
        const convos = await getConversations()
        setConversations(convos)
      }
      setLoading(false)
    }

    initializeMessages()
  }, [])

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.trim().length > 2) {
      const supabase = createClient()
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .eq("is_profile_public", true)
        .limit(10)

      setSearchResults(users || [])
    } else {
      setSearchResults([])
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      await sendMessage(selectedConversation, newMessage.trim())
      setNewMessage("")
      toast.success("Message sent!")
      // Refresh messages would go here
    } catch (error: any) {
      toast.error(error.message || "Failed to send message")
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Conversations</span>
              <Badge variant="secondary">{conversations.length}</Badge>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="p-4 border-b">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Search Results</h4>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        setSelectedConversation(user.id)
                        setSearchTerm("")
                        setSearchResults([])
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ""} alt={user.display_name} />
                        <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.display_name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Existing Conversations */}
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                  <p className="text-gray-500 mb-4">Start a conversation by searching for users above</p>
                  <Link href="/users">
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Browse Community
                    </Button>
                  </Link>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer border-b ${
                      selectedConversation === conversation.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={conversation.other_user.avatar_url || ""}
                        alt={conversation.other_user.display_name}
                      />
                      <AvatarFallback>{conversation.other_user.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{conversation.other_user.display_name}</p>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conversation.last_message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(conversation.last_message_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto max-h-96">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === currentUser?.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-8 text-center h-full flex items-center justify-center">
              <div>
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the left to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
