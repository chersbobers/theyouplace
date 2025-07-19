"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share, Bookmark, Send } from "lucide-react"
import { toggleLike, toggleBookmark, deletePost } from "@/app/actions/posts"
import { createComment } from "@/app/actions/comments"
import type { Post, Comment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: Post & { comments?: Comment[] }
  currentUserId?: string
  showComments?: boolean
}

export function PostCard({ post, currentUserId, showComments = false }: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentContent, setCommentContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = () => toggleLike(post.id)

  const handleBookmark = async () => {
    await toggleBookmark(post.id)
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(post.id)
    }
  }

  const handleComment = async () => {
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

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.profiles.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{post.profiles.display_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{post.profiles.display_name}</h3>
            <p className="text-sm text-muted-foreground">@{post.profiles.username}</p>
          </div>
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
              {post.likes_count}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsCommenting(!isCommenting)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {post.comments_count}
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={post.is_bookmarked ? "text-blue-500" : ""}
          >
            <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>

        {isCommenting && (
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

        {showComments && post.comments && post.comments.length > 0 && (
          <div className="space-y-3 pt-3 border-t">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.profiles.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{comment.profiles.display_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.profiles.display_name}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
