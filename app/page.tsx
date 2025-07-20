import { createClient } from "@/lib/supabase-server"
import { PostCard } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Video, Trophy } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get posts for everyone (guest and authenticated)
  const { data: posts = [] } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url,
        level,
        xp
      ),
      post_likes (count),
      post_comments (count),
      post_bookmarks (count)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get user profile if authenticated
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    userProfile = profile
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">YouPlace</h1>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <Video className="w-3 h-3 mr-1" />
                YouTube Clone
              </Badge>
            </div>

            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/users">
                    <Button variant="ghost" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Users
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                  {userProfile && (
                    <Link href={`/profile/${userProfile.username}`}>
                      <Button variant="outline" size="sm">
                        <Trophy className="w-4 h-4 mr-2" />
                        Level {userProfile.level || 1}
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Guest Mode</Badge>
                  <AuthForm />
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Welcome Section */}
        {!user && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-center">Welcome to YouPlace! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Share YouTube videos, connect with others, and build your community presence!
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Video className="w-4 h-4 text-blue-500" />
                  <span>Share Videos</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-green-500" />
                  <span>Chat & Comment</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>Earn XP & Badges</span>
                </div>
              </div>
              <AuthForm />
            </CardContent>
          </Card>
        )}

        {/* Create Post Section */}
        {user && (
          <div className="mb-6">
            <CreatePost />
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user?.id} />)
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to share something amazing!</p>
                {user ? <CreatePost /> : <p className="text-sm text-muted-foreground">Sign in to start posting</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
