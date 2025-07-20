"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video, Send } from "lucide-react"
import { createPost } from "@/app/actions/posts"
import { useRouter } from "next/navigation"

export function CreatePost() {
  const [content, setContent] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !youtubeUrl.trim()) return

    setIsSubmitting(true)
    try {
      await createPost(content, youtubeUrl)
      setContent("")
      setYoutubeUrl("")
      router.refresh()
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Share Something Amazing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, experiences, or anything interesting..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="youtube">YouTube URL (optional)</Label>
            <Input
              id="youtube"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting || (!content.trim() && !youtubeUrl.trim())} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Posting..." : "Share Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
