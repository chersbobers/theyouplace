"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video, Send } from "lucide-react"
import { createPost } from "@/app/actions/posts"

export function CreatePost() {
  const [content, setContent] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !youtubeUrl.trim()) return

    setIsSubmitting(true)
    await createPost(content, youtubeUrl)
    setContent("")
    setYoutubeUrl("")
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Video className="w-5 h-5" />
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
              className="min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="youtube">YouTube Video (optional)</Label>
            <Input
              id="youtube"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isSubmitting || (!content.trim() && !youtubeUrl.trim())} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Posting..." : "Share Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
