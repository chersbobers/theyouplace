"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPost } from "@/app/actions/posts"
import { Youtube, Send } from "lucide-react"

export function CreatePost() {
  const [content, setContent] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !youtubeUrl.trim()) return

    setIsSubmitting(true)
    try {
      await createPost(content.trim(), youtubeUrl.trim() || null)
      setContent("")
      setYoutubeUrl("")
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
          <Youtube className="w-5 h-5 text-red-500" />
          Share Something
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, ask a question, or tell us about a great video..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube-url">YouTube URL (optional)</Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={(!content.trim() && !youtubeUrl.trim()) || isSubmitting} className="gap-2">
              <Send className="w-4 h-4" />
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
