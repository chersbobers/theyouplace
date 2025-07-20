"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { likePost } from "@/app/actions/posts"
import { Heart, MessageCircle, Share, Calendar } from "lucide-react"
import { toast } from "sonner"

interface PostCardProps {
  post: {
    id: string
    content: string
    youtube_url?: string
    likes_count: number
    comments_count: number
    created_at: string
    user: {
      username: string
      display_name: string
      avatar_url?: string
    }
  }
}

export function PostCard({ post }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    setIsLiking(true)
    try {
      const result = await likePost(post.id)
      if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Failed to like post")
    } finally {
      setIsLiking(false)
    }
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null
  }

  return (
    <Card className="bg-black/80 border-pink-500/30 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-pink-500/50">
            <AvatarImage src={post.user.avatar_url || "/placeholder.svg"} alt={post.user.display_name} />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              {post.user.display_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-pink-300">{post.user.display_name}</h3>
            <p className="text-sm text-gray-400">@{post.user.username}</p>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {post.content && <p className="text-white leading-relaxed">{post.content}</p>}

        {post.youtube_url && (
          <div className="aspect-video rounded-lg overflow-hidden border-2 border-purple-500/50">
            <iframe
              src={getYouTubeEmbedUrl(post.youtube_url) || ""}
              title="YouTube video"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
          >
            <Heart className={`h-4 w-4 mr-2 ${isLiking ? "animate-pulse" : ""}`} />
            {post.likes_count}
          </Button>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
            <MessageCircle className="h-4 w-4 mr-2" />
            {post.comments_count}
          </Button>
          <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
