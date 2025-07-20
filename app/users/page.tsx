import { createServerClient } from "@/lib/supabase-server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function UsersPage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get all users
  const { data: users = [] } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

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
          <h1 className="text-xl font-bold">Community Members</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{profile.display_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{profile.display_name || "Anonymous"}</h3>
                    <p className="text-sm text-muted-foreground">@{profile.username || "user"}</p>
                  </div>
                </div>

                {profile.bio && <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="font-semibold">{profile.posts_count || 0}</span>
                      <span className="text-muted-foreground ml-1">Posts</span>
                    </div>
                    <div>
                      <span className="font-semibold">{profile.xp || 0}</span>
                      <span className="text-muted-foreground ml-1">XP</span>
                    </div>
                  </div>
                  <Badge variant="secondary">Level {profile.level || 1}</Badge>
                </div>

                {user && user.id !== profile.id && (
                  <Link href={`/messages?user=${profile.username}`}>
                    <Button size="sm" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
