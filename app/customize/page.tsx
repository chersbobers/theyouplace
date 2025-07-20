"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Palette, Save, Upload, Eye, Music, LinkIcon } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { updateProfileCustomization } from "@/app/actions/profile"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

const PRESET_THEMES = [
  {
    name: "Ocean Blue",
    primary: "#0ea5e9",
    secondary: "#0284c7",
    accent: "#38bdf8",
    background: "#f0f9ff",
    text: "#0c4a6e",
  },
  {
    name: "Forest Green",
    primary: "#059669",
    secondary: "#047857",
    accent: "#10b981",
    background: "#f0fdf4",
    text: "#064e3b",
  },
  {
    name: "Sunset Orange",
    primary: "#ea580c",
    secondary: "#dc2626",
    accent: "#f97316",
    background: "#fff7ed",
    text: "#9a3412",
  },
  {
    name: "Purple Dream",
    primary: "#9333ea",
    secondary: "#7c3aed",
    accent: "#a855f7",
    background: "#faf5ff",
    text: "#581c87",
  },
  {
    name: "Rose Gold",
    primary: "#e11d48",
    secondary: "#be185d",
    accent: "#f43f5e",
    background: "#fff1f2",
    text: "#881337",
  },
  {
    name: "Dark Mode",
    primary: "#3b82f6",
    secondary: "#1d4ed8",
    accent: "#60a5fa",
    background: "#111827",
    text: "#f9fafb",
  },
]

export default function CustomizePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customization, setCustomization] = useState({
    theme_primary_color: "#3b82f6",
    theme_secondary_color: "#1d4ed8",
    theme_accent_color: "#60a5fa",
    theme_background_color: "#ffffff",
    theme_text_color: "#111827",
    banner_image: "",
    background_image: "",
    profile_music: "",
    custom_css: "",
    social_links: {} as Record<string, string>,
    profile_widgets: [
      { type: "bio", enabled: true, order: 1 },
      { type: "stats", enabled: true, order: 2 },
      { type: "recent_posts", enabled: true, order: 3 },
      { type: "social_links", enabled: false, order: 4 },
    ],
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
          setCustomization({
            theme_primary_color: profile.theme_primary_color || "#3b82f6",
            theme_secondary_color: profile.theme_secondary_color || "#1d4ed8",
            theme_accent_color: profile.theme_accent_color || "#60a5fa",
            theme_background_color: profile.theme_background_color || "#ffffff",
            theme_text_color: profile.theme_text_color || "#111827",
            banner_image: profile.banner_image || "",
            background_image: profile.background_image || "",
            profile_music: profile.profile_music || "",
            custom_css: profile.custom_css || "",
            social_links:
              typeof profile.social_links === "string" ? JSON.parse(profile.social_links) : profile.social_links || {},
            profile_widgets:
              typeof profile.profile_widgets === "string"
                ? JSON.parse(profile.profile_widgets)
                : profile.profile_widgets || [
                    { type: "bio", enabled: true, order: 1 },
                    { type: "stats", enabled: true, order: 2 },
                    { type: "recent_posts", enabled: true, order: 3 },
                    { type: "social_links", enabled: false, order: 4 },
                  ],
          })
        }
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  const applyTheme = (theme: (typeof PRESET_THEMES)[0]) => {
    setCustomization({
      ...customization,
      theme_primary_color: theme.primary,
      theme_secondary_color: theme.secondary,
      theme_accent_color: theme.accent,
      theme_background_color: theme.background,
      theme_text_color: theme.text,
    })
  }

  const handleSocialLinkChange = (platform: string, url: string) => {
    setCustomization({
      ...customization,
      social_links: {
        ...customization.social_links,
        [platform]: url,
      },
    })
  }

  const toggleWidget = (widgetType: string) => {
    setCustomization({
      ...customization,
      profile_widgets: customization.profile_widgets.map((widget) =>
        widget.type === widgetType ? { ...widget, enabled: !widget.enabled } : widget,
      ),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateProfileCustomization(customization)
      toast.success("Profile customization saved!")
    } catch (error: any) {
      toast.error(error.message || "Failed to save customization")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Profile not found. Please try signing in again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Palette className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Customize Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customization Panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="theme" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="theme" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Color Theme</CardTitle>
                  <CardDescription>Choose a preset theme or customize your own colors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Preset Themes */}
                  <div>
                    <Label className="text-base font-medium">Preset Themes</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {PRESET_THEMES.map((theme) => (
                        <Button
                          key={theme.name}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-center space-y-2 bg-transparent"
                          onClick={() => applyTheme(theme)}
                        >
                          <div className="flex space-x-1">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }} />
                          </div>
                          <span className="text-xs">{theme.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={customization.theme_primary_color}
                          onChange={(e) => setCustomization({ ...customization, theme_primary_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customization.theme_primary_color}
                          onChange={(e) => setCustomization({ ...customization, theme_primary_color: e.target.value })}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={customization.theme_secondary_color}
                          onChange={(e) =>
                            setCustomization({ ...customization, theme_secondary_color: e.target.value })
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customization.theme_secondary_color}
                          onChange={(e) =>
                            setCustomization({ ...customization, theme_secondary_color: e.target.value })
                          }
                          placeholder="#1d4ed8"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="accent-color"
                          type="color"
                          value={customization.theme_accent_color}
                          onChange={(e) => setCustomization({ ...customization, theme_accent_color: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customization.theme_accent_color}
                          onChange={(e) => setCustomization({ ...customization, theme_accent_color: e.target.value })}
                          placeholder="#60a5fa"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="background-color">Background Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="background-color"
                          type="color"
                          value={customization.theme_background_color}
                          onChange={(e) =>
                            setCustomization({ ...customization, theme_background_color: e.target.value })
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customization.theme_background_color}
                          onChange={(e) =>
                            setCustomization({ ...customization, theme_background_color: e.target.value })
                          }
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Widgets</CardTitle>
                  <CardDescription>Choose which sections to display on your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customization.profile_widgets.map((widget) => (
                    <div key={widget.type} className="flex items-center justify-between">
                      <div>
                        <Label className="text-base capitalize">{widget.type.replace("_", " ")}</Label>
                        <p className="text-sm text-gray-500">
                          {widget.type === "bio" && "Display your bio section"}
                          {widget.type === "stats" && "Show your stats (posts, followers, etc.)"}
                          {widget.type === "recent_posts" && "Display your recent posts"}
                          {widget.type === "social_links" && "Show your social media links"}
                        </p>
                      </div>
                      <Switch checked={widget.enabled} onCheckedChange={() => toggleWidget(widget.type)} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Add links to your social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {["Twitter", "Instagram", "YouTube", "TikTok", "LinkedIn", "GitHub"].map((platform) => (
                    <div key={platform} className="space-y-2">
                      <Label htmlFor={platform.toLowerCase()}>{platform}</Label>
                      <Input
                        id={platform.toLowerCase()}
                        type="url"
                        placeholder={`https://${platform.toLowerCase()}.com/yourusername`}
                        value={customization.social_links[platform] || ""}
                        onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Images</CardTitle>
                  <CardDescription>Customize your banner and background images</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="banner-image">Banner Image URL</Label>
                    <Input
                      id="banner-image"
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                      value={customization.banner_image}
                      onChange={(e) => setCustomization({ ...customization, banner_image: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background-image">Background Image URL</Label>
                    <Input
                      id="background-image"
                      type="url"
                      placeholder="https://example.com/background.jpg"
                      value={customization.background_image}
                      onChange={(e) => setCustomization({ ...customization, background_image: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Music</CardTitle>
                  <CardDescription>Add a song that represents you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="profile-music">Now Playing</Label>
                    <Input
                      id="profile-music"
                      placeholder="Artist - Song Title"
                      value={customization.profile_music}
                      onChange={(e) => setCustomization({ ...customization, profile_music: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS</CardTitle>
                  <CardDescription>Add custom CSS to further personalize your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="custom-css">CSS Code</Label>
                    <Textarea
                      id="custom-css"
                      placeholder="/* Your custom CSS here */"
                      value={customization.custom_css}
                      onChange={(e) => setCustomization({ ...customization, custom_css: e.target.value })}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg p-4 min-h-[300px]"
                style={{
                  backgroundColor: customization.theme_background_color,
                  color: customization.theme_text_color,
                  backgroundImage: customization.background_image
                    ? `url(${customization.background_image})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Banner Preview */}
                {customization.banner_image && (
                  <div
                    className="h-20 rounded-lg mb-4 bg-cover bg-center"
                    style={{ backgroundImage: `url(${customization.banner_image})` }}
                  />
                )}

                {/* Profile Preview */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300" />
                    <div>
                      <h3 className="font-semibold" style={{ color: customization.theme_text_color }}>
                        {profile.display_name}
                      </h3>
                      <p className="text-sm opacity-75">@{profile.username}</p>
                    </div>
                  </div>

                  {profile.bio && <p className="text-sm opacity-90">{profile.bio}</p>}

                  {customization.profile_music && (
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4" style={{ color: customization.theme_primary_color }} />
                      <span className="text-sm">{customization.profile_music}</span>
                    </div>
                  )}

                  <div className="flex space-x-4 text-sm">
                    <div>
                      <span className="font-semibold" style={{ color: customization.theme_primary_color }}>
                        {profile.posts_count}
                      </span>{" "}
                      Posts
                    </div>
                    <div>
                      <span className="font-semibold" style={{ color: customization.theme_primary_color }}>
                        {profile.followers_count}
                      </span>{" "}
                      Followers
                    </div>
                  </div>

                  {Object.keys(customization.social_links).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(customization.social_links)
                        .filter(([_, url]) => url)
                        .map(([platform, _]) => (
                          <Badge
                            key={platform}
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: customization.theme_primary_color,
                              color: customization.theme_primary_color,
                            }}
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            {platform}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={saving} size="lg">
          {saving ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Customization
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
