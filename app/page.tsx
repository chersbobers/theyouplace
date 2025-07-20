import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { PostCard } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"
import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle, Video, Star } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })

  let user = null
  let posts = []
  let userProfile = null

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      userProfile = profile
    }

    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:author_id (
          username,
          display_name,
          avatar_url,
          level,
          xp
        ),
        post_likes (count),
        comments (count)
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    posts = postsData || []
  } catch (error) {
    console.error("Error loading data:", error)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-blue-600">YouPlace</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Share YouTube videos, connect with friends, and build your community. Join thousands of creators and
              viewers in one amazing place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <AuthForm />
              <p className="text-sm text-gray-500">Sign in to post, like, comment, and message other users</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Share Videos</h3>
                <p className="text-sm text-gray-600">Share your favorite YouTube videos with the community</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Direct Messages</h3>
                <p className="text-sm text-gray-600">Chat privately with other users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Earn Badges</h3>
                <p className="text-sm text-gray-600">Level up and earn badges for your activity</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Build Community</h3>
                <p className="text-sm text-gray-600">Connect with like-minded people</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Posts Preview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
            <div className="space-y-6">
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="relative">
                  <PostCard post={post} currentUser={null} />
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 mb-2">Sign in to interact</p>
                      <AuthForm />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">YouPlace</h1>
            <p className="text-gray-600">Share, connect, and discover amazing content</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/users">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Browse Users
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </Link>
            {userProfile && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Level {userProfile.level || 1}</Badge>
                <Badge variant="outline">{userProfile.xp || 0} XP</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Create Post */}
        <div className="mb-8">
          <CreatePost />
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">Be the first to share something amazing!</p>
                <CreatePost />
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} currentUser={user} />)
          )}
        </div>
      </div>
    </div>
  )
}
