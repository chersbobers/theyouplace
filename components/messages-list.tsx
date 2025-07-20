"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface MessagesListProps {
  conversations: any[]
  currentUserId: string
}

export function MessagesList({ conversations, currentUserId }: MessagesListProps) {
  return (
    <Card className="h-full rounded-none border-0">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {conversations.map((partner) => (
            <Link key={partner.id} href={`/messages?user=${partner.username}`}>
              <div className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={partner.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{partner.display_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm truncate">{partner.display_name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(partner.lastMessageTime))} ago
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{partner.lastMessage}</p>
                </div>
              </div>
            </Link>
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Start messaging someone to see conversations here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
