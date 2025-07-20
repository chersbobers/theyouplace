"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Video, Loader2, Send } from "lucide-react"
import { createPost } from "@/app/actions/posts"
import { toast } from "sonner"

export function CreatePost() {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [activeTab, setActiveTab] = useState("text")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !youtubeUrl.trim()) {
      toast.error("Please add some content or a YouTube video")
      return
    }

    setLoading(true)

    try {
      await createPost(content.trim() || null, youtubeUrl.trim() || null)
      setContent("")
      setYoutubeUrl("")
      setActiveTab("text")
      toast.success("Post shared successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Share with The You Place
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Text Post
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                YouTube Video
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">What's on your mind?</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts with the community..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">{content.length}/500 characters</div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube Video URL</Label>
                <Input
                  id="youtube-url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-content">Caption (optional)</Label>
                <Textarea
                  id="video-content"
                  placeholder="Add a caption for your video..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Share Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
