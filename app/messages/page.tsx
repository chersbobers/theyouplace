import { createServerClient } from "@/lib/supabase-server"
import { MessagesList } from "@/components/messages-list"
import { ChatWindow } from "@/components/chat-window"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { user?: string }
}) {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to access messages</h1>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const selectedUser = searchParams.user

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl h-[calc(100vh-80px)] flex">
        <div className="w-1/3 border-r">
          <MessagesList currentUserId={user.id} selectedUser={selectedUser} />
        </div>
        <div className="flex-1">
          {selectedUser ? (
            <ChatWindow currentUserId={user.id} otherUsername={selectedUser} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
