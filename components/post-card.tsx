"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share, Calendar } from "lucide-react"
import { likePost } from "@/app/actions/posts"
import type { Post, User } from "@/lib/types"
import Link from "next/link"

interface PostCardProps {
  post: Post
  currentUser: User
}

export function PostCard({ post, currentUser }: PostCardProps) {
  const [liked, setLiked] = useState(post.liked_by_user || false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return

    setLoading(true)
    try {
      const result = await likePost(post.id)
      if (result.success) {
        setLiked(!liked)
        setLikesCount((prev) => (liked ? prev - 1 : prev + 1))
      }
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setLoading(false)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const embedUrl = post.video_url ? getYouTubeEmbedUrl(post.video_url) : null

  return (
    <div className="retro-border bg-black/50 p-6 rounded-lg sparkle">
      <div className="flex items-start space-x-3">
        <Link href={`/profile/${post.user?.username}`}>
          <Avatar className="h-10 w-10 retro-border">
            <AvatarImage src={post.user?.avatar_url || ""} alt={post.user?.display_name || post.user?.username} />
            <AvatarFallback className="bg-pink-500 text-white">
              {(post.user?.display_name || post.user?.username || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <Link
              href={`/profile/${post.user?.username}`}
              className="font-semibold text-pink-300 hover:text-pink-500 retro-font"
            >
              {post.user?.display_name || post.user?.username}
              {post.user?.username === "chersbobers" && <span className="ml-2 text-yellow-400">⭐ Creator</span>}
            </Link>
            <span className="text-pink-500">•</span>
            <div className="flex items-center text-sm text-pink-400">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(post.created_at)}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-white whitespace-pre-wrap break-words">{post.content}</p>
          </div>

          {embedUrl && (
            <div className="mb-4 retro-border rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
                title="YouTube video"
                className="w-full h-64 md:h-80"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="flex items-center space-x-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-1 ${
                liked ? "text-pink-500 hover:text-pink-600" : "text-pink-300 hover:text-pink-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-pink-300 hover:text-pink-500">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-pink-300 hover:text-pink-500">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
