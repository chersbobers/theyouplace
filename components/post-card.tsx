"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Bookmark, Share, MessageSquare, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { likePost, bookmarkPost } from "@/app/actions/posts"
import { createComment } from "@/app/actions/comments"
import { Textarea } from "@/components/ui/textarea"

interface PostCardProps {
  post: any
  currentUserId?: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = async () => {
    if (!currentUserId) return
    setIsLiked(!isLiked)
    await likePost(post.id)
  }

  const handleBookmark = async () => {
    if (!currentUserId) return
    setIsBookmarked(!isBookmarked)
    await bookmarkPost(post.id)
  }

  const handleComment = async () => {
    if (!currentUserId || !newComment.trim()) return
    setIsSubmitting(true)
    await createComment(post.id, newComment)
    setNewComment("")
    setIsSubmitting(false)
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null
  }

  const embedUrl = post.youtube_url ? getYouTubeEmbedUrl(post.youtube_url) : null

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{post.profiles?.display_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{post.profiles?.display_name || "Anonymous"}</h3>
                <Badge variant="secondary" className="text-xs">
                  Level {post.profiles?.level || 1}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                @{post.profiles?.username} • {formatDistanceToNow(new Date(post.created_at))} ago
              </p>
            </div>
          </div>
          {currentUserId && currentUserId !== post.user_id && (
            <Link href={`/messages?user=${post.profiles?.username}`}>
              <Button variant="ghost" size="sm">
                <MessageSquare className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        {post.content && <p className="text-sm leading-relaxed">{post.content}</p>}

        {/* YouTube Embed */}
        {embedUrl && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe src={embedUrl} title="YouTube video" className="absolute inset-0 w-full h-full" allowFullScreen />
          </div>
        )}

        {/* YouTube Link (if no embed) */}
        {post.youtube_url && !embedUrl && (
          <a
            href={post.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-blue-600 hover:underline">{post.youtube_url}</span>
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4">
            {currentUserId ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleLike} className="gap-2">
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  <span className="text-xs">{post.post_likes?.[0]?.count || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">{post.post_comments?.[0]?.count || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleBookmark}>
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">{post.post_likes?.[0]?.count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">{post.post_comments?.[0]?.count || 0}</span>
                </div>
                <span className="text-xs">Sign in to interact</span>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && currentUserId && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px]"
              />
              <Button onClick={handleComment} disabled={isSubmitting || !newComment.trim()}>
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
