"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import type { Post } from "@/lib/types"

interface PostCardProps {
  post: Post
  currentUserId: string | null
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const videoId = post.youtube_url ? extractVideoId(post.youtube_url) : null

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${post.profiles.username}`}>
              <Avatar className="cursor-pointer">
                <AvatarImage src={post.profiles.avatar_url || ""} alt={post.profiles.display_name} />
                <AvatarFallback>{post.profiles.display_name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <Link href={`/profile/${post.profiles.username}`}>
                  <h3 className="font-semibold hover:underline cursor-pointer">{post.profiles.display_name}</h3>
                </Link>
                {post.profiles.username === "chersbobers" && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                    ⭐ Creator
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href={`/profile/${post.profiles.username}`}>
                  <span className="hover:underline cursor-pointer">@{post.profiles.username}</span>
                </Link>
                <span>•</span>
                <span>Level {post.profiles.level}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <div className="text-gray-900 whitespace-pre-wrap">{post.content}</div>

        {/* YouTube Video */}
        {videoId && (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-500">
              <Share className="w-4 h-4" />
              <span>{post.shares_count}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
