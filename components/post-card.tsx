"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { likePost, unlikePost } from "@/app/actions/posts"
import Link from "next/link"

interface PostCardProps {
  post: any
  currentUser: any
}

export function PostCard({ post, currentUser }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.post_likes?.[0]?.count || 0)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please sign in to like posts!")
      return
    }

    setIsLiking(true)
    try {
      if (isLiked) {
        await unlikePost(post.id)
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await likePost(post.id)
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const videoId = post.youtube_url ? getYouTubeVideoId(post.youtube_url) : null

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{post.profiles?.display_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/profile/${post.profiles?.username}`} className="font-semibold hover:underline">
                {post.profiles?.display_name || "Anonymous"}
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">@{post.profiles?.username || "user"}</span>
                <Badge variant="secondary" className="text-xs">
                  Level {post.profiles?.level || 1}
                </Badge>
              </div>
            </div>
          </div>
          <span className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        {post.content && <p className="text-gray-800 leading-relaxed">{post.content}</p>}

        {/* YouTube Video */}
        {videoId && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 ${isLiked ? "text-red-600" : "text-gray-600"}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-600"
              onClick={() => {
                if (!currentUser) {
                  alert("Please sign in to comment!")
                }
              }}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments?.[0]?.count || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-600"
              onClick={() => {
                if (!currentUser) {
                  alert("Please sign in to bookmark!")
                }
              }}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600"
            onClick={() => {
              navigator.share?.({
                title: "Check out this post on YouPlace",
                url: window.location.href,
              }) || navigator.clipboard.writeText(window.location.href)
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Sign in prompt for guests */}
        {!currentUser && (
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600 mb-2">Want to interact with this post?</p>
            <Link href="/auth">
              <Button size="sm" variant="outline">
                Sign In to Like & Comment
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
