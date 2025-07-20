"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share, Play } from "lucide-react"
import { likePost, addComment } from "@/app/actions/posts"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import type { Post } from "@/lib/types"

interface PostCardProps {
  post: Post
  currentUserId?: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = async () => {
    if (!currentUserId) return

    try {
      await likePost(post.id)
      setIsLiked(!isLiked)
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = async () => {
    if (!currentUserId || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      await addComment(post.id, newComment.trim())
      setNewComment("")
      // Refresh comments would go here
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const videoId = post.youtube_url ? getYouTubeVideoId(post.youtube_url) : null

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{post.profiles?.display_name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${post.profiles?.username}`} className="font-semibold hover:underline">
                {post.profiles?.display_name || "Anonymous"}
              </Link>
              <Badge variant="secondary" className="text-xs">
                @{post.profiles?.username || "user"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        {post.content && <p className="text-sm leading-relaxed">{post.content}</p>}

        {/* YouTube Video */}
        {videoId && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              className="w-full h-full"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${isLiked ? "text-red-500" : ""}`}
            disabled={!currentUserId}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>

          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="gap-2">
            <MessageCircle className="w-4 h-4" />
            {post.comments_count || 0}
          </Button>

          <Button variant="ghost" size="sm" className="gap-2">
            <Share className="w-4 h-4" />
            Share
          </Button>

          {post.youtube_url && (
            <Button variant="ghost" size="sm" asChild className="gap-2 ml-auto">
              <a href={post.youtube_url} target="_blank" rel="noopener noreferrer">
                <Play className="w-4 h-4" />
                Watch on YouTube
              </a>
            </Button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            {/* Add Comment */}
            {currentUserId && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleComment} disabled={!newComment.trim() || isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Comments will appear here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
