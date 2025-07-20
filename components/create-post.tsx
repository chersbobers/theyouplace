"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPost } from "@/app/actions/posts"
import { toast } from "sonner"
import { Loader2, Video, ImageIcon, Send } from "lucide-react"

export function CreatePost() {
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) {
      toast.error("Please enter some content")
      return
    }

    setIsLoading(true)
    try {
      await createPost(content, youtubeUrl || undefined)
      setContent("")
      setYoutubeUrl("")
      toast.success("Post created successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Share Something Amazing
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, experiences, or anything interesting..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">{content.length}/500</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube-url" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              YouTube Video (Optional)
            </Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" disabled>
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
            </div>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
