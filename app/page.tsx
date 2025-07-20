import { createClient } from "@/lib/supabase-server"
import { getUser } from "@/lib/supabase-server"
import { PostCard } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function HomePage() {
  const user = await getUser()
  const supabase = await createClient()

  // Get posts with author info
  const { data: posts = [] } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id (
        username,
        display_name,
        avatar_url,
        level
      ),
      post_likes (count),
      comments (count)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">YouPlace</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">Welcome, {user.profile?.display_name}!</span>
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Message for Guests */}
        {!user && (
          <Card className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Welcome to YouPlace! 🎉</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Discover amazing YouTube videos and connect with the community. Sign in to post, like, and comment!
              </p>
              <Link href="/auth">
                <Button className="bg-red-600 hover:bg-red-700">Join the Community</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Create Post - Only for logged in users */}
        {user && (
          <div className="mb-8">
            <CreatePost user={user} />
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">No posts yet!</p>
                {user && <p className="text-sm text-gray-400">Be the first to share something awesome!</p>}
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} currentUser={user} />)
          )}
        </div>

        {/* Call to Action for Guests */}
        {!user && posts.length > 0 && (
          <Card className="mt-8 text-center bg-gray-900 text-white">
            <CardContent className="py-8">
              <h3 className="text-xl font-bold mb-2">Ready to Join?</h3>
              <p className="text-gray-300 mb-4">Sign in to like posts, leave comments, and share your own content!</p>
              <Link href="/auth">
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
