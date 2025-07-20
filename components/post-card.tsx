"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share, Bookmark, Send, MessageSquare } from "lucide-react"
import { toggleLike, toggleBookmark } from "@/app/actions/posts"
import { createComment } from "@/app/actions/comments"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface PostCardProps {
  post: any
  currentUserId?: string
  isGuest?: boolean
}

export function PostCard({ post, currentUserId, isGuest = false }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentContent, setCommentContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = () => {
    if (isGuest) {
      alert("Please sign in to like posts!")
      return
    }
    toggleLike(post.id)
  }

  const handleBookmark = async () => {
    if (isGuest) {
      alert("Please sign in to bookmark posts!")
      return
    }
    await toggleBookmark(post.id)
  }

  const handleComment = async () => {
    if (isGuest) {
      alert("Please sign in to comment!")
      return
    }
    if (!commentContent.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("postId", post.id)
    formData.append("content", commentContent)

    await createComment(formData)
    setCommentContent("")
    setIsCommenting(false)
    setIsSubmitting(false)
  }

  const handleDM = () => {
    if (isGuest) {
      alert("Please sign in to send messages!")
      return
    }
    // Redirect to DM with this user
    window.location.href = `/messages?user=${post.profiles.username}`
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{post.profiles?.display_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{post.profiles?.display_name || "Anonymous"}</h3>
              <p className="text-sm text-muted-foreground">
                @{post.profiles?.username || "user"} · {timeAgo}
              </p>
            </div>
          </div>
          {!isGuest && currentUserId !== post.user_id && (
            <Button variant="ghost" size="sm" onClick={handleDM}>
              <MessageSquare className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap">{post.content}</p>

        {post.type === "video" && post.video_url && (
          <iframe
            width="100%"
            height="315"
            src={post.video_url}
            title={post.video_title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg overflow-hidden w-full aspect-video"
          />
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={handleLike}>
              <Heart className={`w-4 h-4 mr-2 ${post.is_liked ? "fill-red-500 text-red-500" : ""}`} />
              {post.likes_count || 0}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => !isGuest && setIsCommenting(!isCommenting)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {post.comments_count || 0}
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBookmark}>
            <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? "fill-blue-500 text-blue-500" : ""}`} />
          </Button>
        </div>

        {isCommenting && !isGuest && (
          <div className="space-y-3 pt-3 border-t">
            <Textarea
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsCommenting(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleComment} disabled={!commentContent.trim() || isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        )}

        {isGuest && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground text-center">
              <Link href="/auth" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to like, comment, and interact with posts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
