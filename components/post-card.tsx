"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Bookmark, Share2, Send, User, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from "@/app/actions/posts"
import { addComment } from "@/app/actions/comments"
import Link from "next/link"

interface PostCardProps {
  post: any
  currentUser: any
}

export function PostCard({ post, currentUser }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(post.comments || [])
  const [likeCount, setLikeCount] = useState(post.post_likes?.[0]?.count || 0)

  const handleLike = async () => {
    if (!currentUser) return

    try {
      if (isLiked) {
        await unlikePost(post.id)
        setLikeCount((prev) => prev - 1)
      } else {
        await likePost(post.id)
        setLikeCount((prev) => prev + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleBookmark = async () => {
    if (!currentUser) return

    try {
      if (isBookmarked) {
        await unbookmarkPost(post.id)
      } else {
        await bookmarkPost(post.id)
      }
      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error("Error toggling bookmark:", error)
    }
  }

  const handleComment = async () => {
    if (!currentUser || !newComment.trim()) return

    try {
      const comment = await addComment(post.id, newComment)
      setComments([...comments, comment])
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const videoId = post.youtube_url ? extractVideoId(post.youtube_url) : null

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/profile/${post.profiles?.username}`} className="font-semibold hover:underline">
                  {post.profiles?.display_name || post.profiles?.username || "Anonymous"}
                </Link>
                <Badge variant="secondary" className="text-xs">
                  Level {post.profiles?.level || 1}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          {currentUser && (
            <Link href={`/messages?user=${post.profiles?.username}`}>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {post.content && <p className="text-gray-900">{post.content}</p>}

        {videoId && (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? "text-red-500" : ""}>
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                {likeCount}
              </Button>
            ) : (
              <div className="flex items-center text-gray-500">
                <Heart className="h-4 w-4 mr-1" />
                {likeCount}
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-4 w-4 mr-1" />
              {comments.length}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? "text-blue-500" : ""}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            )}

            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            {currentUser && (
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={handleComment} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">
                        {comment.profiles?.display_name || comment.profiles?.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {!currentUser && (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">Sign in to comment</p>
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
