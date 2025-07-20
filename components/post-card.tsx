"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share, Star } from "lucide-react"
import { likePost } from "@/app/actions/posts"
import { toast } from "sonner"
import Link from "next/link"
import type { Post } from "@/lib/types"

interface PostCardProps {
  post: Post
  currentUserId: string | null
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to like posts")
      return
    }

    setLoading(true)
    try {
      await likePost(post.id)
      setIsLiked(!isLiked)
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
    } catch (error: any) {
      toast.error(error.message || "Failed to like post")
    } finally {
      setLoading(false)
    }
  }

  const extractYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const youtubeId = post.youtube_url ? extractYouTubeId(post.youtube_url) : null

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${post.profiles?.username}`}>
              <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.display_name || ""} />
                <AvatarFallback>{post.profiles?.display_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${post.profiles?.username}`} className="hover:underline">
                <p className="font-semibold">{post.profiles?.display_name}</p>
              </Link>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">@{post.profiles?.username}</p>
                {post.profiles?.username === "chersbobers" && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                  >
                    ⭐ Creator
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Level {(post.profiles as any)?.level || 1}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.content && <p className="text-gray-800 leading-relaxed">{post.content}</p>}

        {youtubeId && (
          <div className="rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-1 ${isLiked ? "text-red-500" : "text-gray-500"} hover:text-red-500`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-gray-500 hover:text-green-500"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
