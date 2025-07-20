"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Conversation {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  lastMessage: string
  lastMessageTime: string
}

interface MessagesListProps {
  conversations: Conversation[]
  currentUserId: string
}

export function MessagesList({ conversations, currentUserId }: MessagesListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <Link key={conversation.id} href={`/messages?user=${conversation.username}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{conversation.display_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{conversation.display_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="mb-2">No conversations yet</p>
              <Link href="/users">
                <Button variant="outline" size="sm">
                  Find people to message
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
