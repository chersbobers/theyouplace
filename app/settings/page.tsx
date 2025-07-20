"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Save, Upload, Star, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { updateProfile } from "@/app/actions/profile"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    avatar_url: "",
  })

  useEffect(() => {
    const supabase = createClient()

    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (profile) {
          setProfile(profile)
          setFormData({
            username: profile.username,
            display_name: profile.display_name,
            bio: profile.bio || "",
            avatar_url: profile.avatar_url || "",
          })
        }
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateProfile(formData)
      toast.success("Profile updated successfully!")

      // Refresh profile data
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: updatedProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (updatedProfile) {
          setProfile(updatedProfile)
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Profile not found. Please try signing in again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <User className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

      {/* Current Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Profile</CardTitle>
          <CardDescription>Your profile as others see it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
              <AvatarFallback className="text-lg">{profile.display_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-semibold">{profile.display_name}</h3>
                {profile.username === "chersbobers" && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">⭐ Creator</Badge>
                )}
              </div>
              <p className="text-gray-600">@{profile.username}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1" />
                  Level {profile.level}
                </Badge>
                <Badge variant="outline">
                  <Trophy className="w-3 h-3 mr-1" />
                  {profile.xp.toLocaleString()} XP
                </Badge>
              </div>
            </div>
          </div>
          {profile.bio && <p className="mt-4 text-gray-700">{profile.bio}</p>}
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })
                }
                placeholder="your_username"
                required
                minLength={3}
                maxLength={30}
              />
              <p className="text-xs text-gray-500">
                Username can only contain lowercase letters, numbers, and underscores
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your Display Name"
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                maxLength={160}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 text-right">{formData.bio.length}/160</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/your-avatar.jpg"
              />
              <p className="text-xs text-gray-500">Paste a URL to your profile picture (JPG, PNG, or GIF)</p>
            </div>

            <Separator />

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
