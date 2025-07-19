"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createPost } from "@/app/actions/posts"
import { Video, Type, Plus } from "lucide-react"

export function CreatePost() {
  const [content, setContent] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [isVideo, setIsVideo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("type", isVideo ? "video" : "text")
    formData.append("content", content)
    if (isVideo) formData.append("videoUrl", videoUrl)

    await createPost(formData)
    setContent("")
    setVideoUrl("")
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <Button variant={!isVideo ? "default" : "outline"} size="sm" onClick={() => setIsVideo(false)}>
            <Type className="w-4 h-4 mr-2" />
            Text Post
          </Button>
          <Button variant={isVideo ? "default" : "outline"} size="sm" onClick={() => setIsVideo(true)}>
            <Video className="w-4 h-4 mr-2" />
            Video Post
          </Button>
        </div>

        {isVideo && (
          <div>
            <Input
              placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Paste any YouTube video URL</p>
          </div>
        )}

        <Textarea
          placeholder={isVideo ? "What's this video about?" : "What's on your mind?"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Badge variant="secondary">+50 XP for first post</Badge>
            {isVideo && <Badge variant="secondary">+25 XP for video</Badge>}
          </div>
          <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
