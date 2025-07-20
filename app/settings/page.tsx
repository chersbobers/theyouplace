"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Shield, Bell, Palette, Save, Loader2, Star, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import type { Profile } from "@/lib/types"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    avatar_url: "",
    website: "",
  })

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        redirect("/")
        return
      }

      setUser(user)

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        setProfile(profile)
        setFormData({
          username: profile.username || "",
          display_name: profile.display_name || "",
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || "",
          website: profile.website || "",
        })
      }
      setLoading(false)
    }

    getUser()
  }, [])

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      const supabase = createClient()

      // Check if username is taken (if changed)
      if (formData.username !== profile.username) {
        const { data: existingUser } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", formData.username)
          .neq("id", user.id)
          .single()

        if (existingUser) {
          toast.error("Username is already taken")
          setSaving(false)
          return
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setProfile({ ...profile, ...formData })
      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="w-full h-64 bg-gray-200 rounded animate-pulse" />
          <div className="md:col-span-2 w-full h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert>
          <AlertDescription>Please sign in to access your settings.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Settings className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
                <AvatarFallback className="text-lg">{profile.display_name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold">{profile.display_name}</h3>
                <p className="text-sm text-gray-500">@{profile.username}</p>
                {profile.username === "chersbobers" && (
                  <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    ⭐ Creator Badge
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Level</span>
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1" />
                  {profile.level}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">XP</span>
                <Badge variant="outline">
                  <Trophy className="w-3 h-3 mr-1" />
                  {profile.xp}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Posts</span>
                <span className="font-semibold">{profile.posts_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Followers</span>
                <span className="font-semibold">{profile.followers_count}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account">
                <Shield className="w-4 h-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your public profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Enter username"
                      />
                      {profile.username === "chersbobers" && (
                        <p className="text-xs text-yellow-600">⭐ You have the special Creator badge!</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        placeholder="Enter display name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                      type="url"
                    />
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account security and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={user.email} disabled />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <p className="text-sm text-gray-600">{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <p className="text-sm text-gray-600">{new Date(profile.updated_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Notification settings coming soon!</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how The You Place looks for you</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Theme customization coming soon! For now, visit the{" "}
                    <a href="/customize" className="text-blue-500 hover:underline">
                      Profile Customizer
                    </a>{" "}
                    to personalize your profile.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
