"use client"

import { useState, useEffect } from "react"
import { CreatePost } from "@/components/create-post"
import { PostCard } from "@/components/post-card"
import { AuthForm } from "@/components/auth-form"
import { supabase } from "@/lib/supabase"
import type { Post, User } from "@/lib/types"
import { Sparkles, Heart, Users } from "lucide-react"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

          setUser(profile)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    const getPosts = async () => {
      try {
        const { data: postsData } = await supabase
          .from("posts")
          .select(`
            *,
            user:users(*)
          `)
          .order("created_at", { ascending: false })
          .limit(20)

        setPosts(postsData || [])
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
    getPosts()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        setUser(profile)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev])
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-16 w-16 text-pink-500 neon-text" />
            </div>
            <h1 className="myspace-title text-4xl font-bold neon-text text-pink-500 mb-2">THE YOU PLACE</h1>
            <p className="text-pink-300 text-lg retro-font">✨ Express Yourself ✨ Share Your World ✨</p>
            <div className="mt-6 p-4 retro-border bg-black/50 rounded-lg">
              <p className="text-pink-200 mb-4">
                Welcome to your digital space! Create your profile, share posts, connect with friends, and make it
                uniquely yours.
              </p>
              <div className="flex justify-center space-x-6 text-sm text-pink-300">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  Share Posts
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Make Friends
                </div>
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Customize
                </div>
              </div>
            </div>
          </div>
          <AuthForm />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="myspace-title text-3xl font-bold neon-text text-pink-500 mb-2">
          Welcome back, {user.display_name || user.username}! ✨
        </h1>
        <p className="text-pink-300 retro-font">What's on your mind today?</p>
      </div>

      <div className="retro-border bg-black/50 p-6 rounded-lg sparkle">
        <CreatePost onPostCreated={handlePostCreated} />
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="retro-border bg-black/50 p-6 rounded-lg">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-full" />
                    <div className="h-4 bg-pink-500/20 rounded w-24" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-pink-500/20 rounded w-full" />
                    <div className="h-4 bg-pink-500/20 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 retro-border bg-black/50 rounded-lg">
            <Sparkles className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-pink-300 mb-2">No posts yet!</h3>
            <p className="text-pink-400">Be the first to share something amazing!</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUser={user} />)
        )}
      </div>
    </div>
  )
}
