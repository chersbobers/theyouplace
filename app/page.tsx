import { createClient } from "@/lib/supabase-server"
import { PostCard } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Users, Trophy, Star } from "lucide-react"
import Link from "next/link"
import type { Post } from "@/lib/types"

async function getPosts(): Promise<Post[]> {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  return posts || []
}

async function getTopUsers() {
  const supabase = await createClient()

  const { data: users } = await supabase.from("profiles").select("*").order("xp", { ascending: false }).limit(5)

  return users || []
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const posts = await getPosts()
  const topUsers = await getTopUsers()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">TheYouPlace</h1>
              <Badge variant="secondary">Beta</Badge>
            </div>

            <nav className="flex items-center gap-4">
              <Link href="/users">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  Community
                </Button>
              </Link>

              {user && (
                <>
                  <Link href="/messages">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                  <Link href={`/profile/${user.user_metadata?.username || user.email?.split("@")[0]}`}>
                    <Button variant="ghost" size="sm">
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{user.user_metadata?.full_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      Profile
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Welcome to TheYouPlace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Share your favorite YouTube videos, discover new content, and connect with the community!
                </p>
                {!user && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">Sign in to post, comment, and earn XP points!</p>
                    <AuthForm />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create Post */}
            {user && <CreatePost />}

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user?.id} />)
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Level</span>
                      <Badge variant="secondary">1</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">XP</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Posts</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topUsers.map((topUser, index) => (
                    <div key={topUser.id} className="flex items-center gap-3">
                      <div className="text-sm font-medium text-muted-foreground w-4">#{index + 1}</div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={topUser.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{topUser.display_name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{topUser.display_name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{topUser.xp || 0} XP</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        L{topUser.level || 1}
                      </Badge>
                    </div>
                  ))}
                  {topUsers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No users yet. Be the first!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/users" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                      <Users className="w-4 h-4 mr-2" />
                      Browse Users
                    </Button>
                  </Link>
                  {user && (
                    <>
                      <Link href="/messages" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Messages
                        </Button>
                      </Link>
                      <Link href="/customize" className="block">
                        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                          <Star className="w-4 h-4 mr-2" />
                          Customize Profile
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
