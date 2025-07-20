"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPost } from "@/app/actions/posts"
import { Youtube, Type } from "lucide-react"

interface CreatePostProps {
  user: any
}

export function CreatePost({ user }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !youtubeUrl.trim()) {
      alert("Please add some content or a YouTube URL!")
      return
    }

    setIsSubmitting(true)
    try {
      await createPost({
        content: content.trim(),
        youtube_url: youtubeUrl.trim() || null,
        author_id: user.id,
      })

      setContent("")
      setYoutubeUrl("")

      // Refresh the page to show new post
      window.location.reload()
    } catch (error) {
      console.error("Error creating post:", error)
      alert("Failed to create post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Type className="h-5 w-5" />
          <span>Share Something Awesome</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, ask a question, or start a discussion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div>
            <Label htmlFor="youtube-url" className="flex items-center space-x-2">
              <Youtube className="h-4 w-4 text-red-600" />
              <span>YouTube Video (optional)</span>
            </Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting || (!content.trim() && !youtubeUrl.trim())} className="w-full">
            {isSubmitting ? "Posting..." : "Share Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
