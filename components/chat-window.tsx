"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send } from "lucide-react"
import { sendMessage } from "@/app/actions/messages"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: {
    display_name: string
    avatar_url?: string
  }
}

interface ChatWindowProps {
  recipient: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
  currentUserId: string
}

export function ChatWindow({ recipient, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      await sendMessage(recipient.username, newMessage.trim())
      setNewMessage("")
      // In a real app, you'd refresh messages here
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={recipient.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{recipient.display_name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{recipient.display_name}</h3>
            <p className="text-sm text-muted-foreground">@{recipient.username}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-xs ${message.sender_id === currentUserId ? "bg-primary text-primary-foreground" : ""}`}
              >
                <CardContent className="p-3">
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${message.sender_id === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Start a conversation with {recipient.display_name}</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder={`Message ${recipient.display_name}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={!newMessage.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
