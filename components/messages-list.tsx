"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

interface MessagesListProps {
  currentUserId: string
  selectedUser?: string
}

export function MessagesList({ currentUserId, selectedUser }: MessagesListProps) {
  const [conversations, setConversations] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  // Mock conversations for now
  const mockConversations = [
    {
      id: "1",
      username: "john_doe",
      display_name: "John Doe",
      avatar_url: "/placeholder.svg",
      last_message: "Hey, how are you?",
      last_message_time: "2 min ago",
      unread_count: 2,
    },
    {
      id: "2",
      username: "jane_smith",
      display_name: "Jane Smith",
      avatar_url: "/placeholder.svg",
      last_message: "Thanks for sharing that video!",
      last_message_time: "1 hour ago",
      unread_count: 0,
    },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {mockConversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/messages?user=${conversation.username}`}
            className={`block p-4 border-b hover:bg-muted/50 transition-colors ${
              selectedUser === conversation.username ? "bg-muted" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={conversation.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>{conversation.display_name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{conversation.display_name}</h3>
                  <span className="text-xs text-muted-foreground">{conversation.last_message_time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conversation.last_message}</p>
              </div>
              {conversation.unread_count > 0 && (
                <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {conversation.unread_count}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
