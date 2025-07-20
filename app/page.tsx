import { createClient } from "@/lib/supabase-server"
import { getUser } from "@/lib/supabase-server"
import { CreatePost } from "@/components/create-post"
import { PostCard } from "@/components/post-card"
import { AuthForm } from "@/components/auth-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageCircle, Video, Star } from "lucide-react"
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

  const [{ count: usersCount }, { count: postsCount }, { count: videosCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).not("youtube_url", "is", null),
  ])

  return {
    users: usersCount || 0,
    posts: postsCount || 0,
    videos: videosCount || 0,
  }
}

export default async function HomePage() {
  const user = await getUser()
  const posts = await getPosts()
  const stats = await getStats()

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to The You Place
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Where old Twitter, Instagram, and YouTube had a baby. Share your thoughts, videos, and connect with an
              amazing community.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats.users.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Community Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{stats.posts.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Posts Shared</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                <div className="text-2xl font-bold">{stats.videos.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Videos Posted</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Auth Form */}
        <div className="max-w-md mx-auto">
          <AuthForm />
        </div>

        {/* Recent Posts Preview */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">See What's Happening</h2>
          <div className="space-y-4">
            {posts.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} currentUserId={null} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Welcome back, {user.profile?.display_name}!
          </CardTitle>
          <CardDescription>
            Level {user.profile?.level || 1} • {user.profile?.xp || 0} XP
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Create Post */}
      <CreatePost />

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to share something with the community!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} />)
        )}
      </div>
    </div>
  )
}
