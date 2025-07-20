"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPost } from "@/app/actions/posts"
import { Loader2, Send, Video, Type } from "lucide-react"
import type { Post } from "@/lib/types"

interface CreatePostProps {
  onPostCreated: (post: Post) => void
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError("Please write something!")
      return
    }

    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("content", content)
      if (videoUrl) {
        formData.append("video_url", videoUrl)
      }

      const result = await createPost(formData)

      if (result.success && result.post) {
        onPostCreated(result.post)
        setContent("")
        setVideoUrl("")
      } else {
        setError(result.error || "Failed to create post")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Type className="h-5 w-5 text-pink-500" />
        <h3 className="text-lg font-semibold text-pink-300 retro-font">Share Your Thoughts</h3>
      </div>

      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in your world? ✨"
          className="min-h-[100px] bg-black/50 border-pink-500/30 text-white placeholder:text-pink-400 resize-none"
          maxLength={500}
        />
        <div className="text-right text-sm text-pink-400">{content.length}/500</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-url" className="text-pink-300 flex items-center">
          <Video className="h-4 w-4 mr-2" />
          YouTube Video (optional)
        </Label>
        <Input
          id="video-url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="bg-black/50 border-pink-500/30 text-white placeholder:text-pink-400"
        />
      </div>

      {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/30">{error}</div>}

      <Button
        type="submit"
        disabled={loading || !content.trim()}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white retro-border"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
        {loading ? "Posting..." : "Share Post"}
      </Button>
    </form>
  )
}
