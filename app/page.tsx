import { getUser } from "@/lib/supabase-server"
import { createClient } from "@/lib/supabase-server"
import { PostCard } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, MessageCircle, Play } from "lucide-react"
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
        avatar_url,
        level,
        xp
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  return posts || []
}

async function getStats() {
  const supabase = await createClient()

  const [{ count: totalUsers }, { count: totalPosts }, { count: totalComments }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
  ])

  return {
    totalUsers: totalUsers || 0,
    totalPosts: totalPosts || 0,
    totalComments: totalComments || 0,
  }
}

export default async function HomePage() {
  const user = await getUser()
  const posts = await getPosts()
  const stats = await getStats()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl mb-4">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            The You Place
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Where old Twitter, Instagram, and YouTube had a baby. Share your videos, thoughts, and connect with your
          community.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Play className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-pink-500" />
              <div className="text-2xl font-bold">{stats.totalComments.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Post */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              What's happening?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePost user={user} />
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Posts</h2>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending
          </Badge>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                {user
                  ? "Be the first to share something!"
                  : "Sign in to start sharing and see posts from the community."}
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user?.id} />)
        )}
      </div>
    </div>
  )
}
