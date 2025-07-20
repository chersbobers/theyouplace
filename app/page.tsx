import { createClient } from "@/lib/supabase-server"
import { CreatePost } from "@/components/create-post"
import { PostCard } from "@/components/post-card"
import { Sparkles, Heart, Users } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let posts = []
  if (user) {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        user:profiles(username, display_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(20)
    posts = data || []
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Heart className="h-24 w-24 text-pink-500 animate-pulse" />
              <Sparkles className="h-12 w-12 text-purple-400 absolute -top-4 -right-4 animate-bounce" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
            THE YOU PLACE
          </h1>
          <p className="text-2xl text-pink-300 font-semibold mb-6">✨ Your Digital Sanctuary ✨</p>
          <p className="text-lg text-purple-400 mb-8 leading-relaxed">
            Express yourself, connect with friends, and create your perfect digital space. Share your thoughts, videos,
            and memories in a place that's truly yours.
          </p>
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-300 font-semibold">Connect</p>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <p className="text-pink-300 font-semibold">Express</p>
            </div>
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-purple-300 font-semibold">Create</p>
            </div>
          </div>
          <a
            href="/auth"
            className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg shadow-pink-500/25 transition-all duration-300 hover:scale-105"
          >
            Join The Community ✨
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
              Welcome to Your Space
            </h1>
            <p className="text-purple-300">Share your world with the community ✨</p>
          </div>

          <CreatePost />

          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post: any) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-300 mb-2">No posts yet</h3>
                <p className="text-gray-400">Be the first to share something amazing!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
