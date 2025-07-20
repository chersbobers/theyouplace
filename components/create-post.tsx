"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPost } from "@/app/actions/posts"
import { toast } from "sonner"
import { Loader2, Send, Youtube } from "lucide-react"

export function CreatePost() {
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState("")
  const [youtubeUrl, setYoutubeUrl] = useState("")

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await createPost(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Post created! ✨")
        setContent("")
        setYoutubeUrl("")
      }
    } catch (error) {
      toast.error("Failed to create post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-black/80 border-pink-500/50 shadow-lg shadow-pink-500/10">
      <CardHeader>
        <CardTitle className="text-pink-400 flex items-center gap-2">
          <Send className="h-5 w-5" />
          Share Your Thoughts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <Textarea
            name="content"
            placeholder="What's on your mind? ✨"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-gray-800 border-pink-500/30 text-white placeholder:text-gray-400 focus:border-pink-400 min-h-[100px]"
            maxLength={500}
          />
          <div className="flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-500" />
            <Input
              name="youtubeUrl"
              placeholder="YouTube URL (optional)"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="bg-gray-800 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{content.length}/500 characters</span>
            <Button
              type="submit"
              disabled={isLoading || (!content.trim() && !youtubeUrl.trim())}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post ✨
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
