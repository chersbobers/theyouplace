"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Palette, Layout, ImageIcon, Link, Code, Eye, Save, Sparkles, Plus, Trash2, GripVertical } from "lucide-react"
import type { Profile, ProfileTheme, ProfileWidget } from "@/lib/types"

interface ProfileCustomizerProps {
  profile: Profile
  themes: ProfileTheme[]
  onSave: (updates: Partial<Profile>) => void
}

export function ProfileCustomizer({ profile, themes, onSave }: ProfileCustomizerProps) {
  const [customProfile, setCustomProfile] = useState<Profile>(profile)
  const [activeTab, setActiveTab] = useState("theme")
  const [previewMode, setPreviewMode] = useState(false)

  const updateProfile = (updates: Partial<Profile>) => {
    setCustomProfile((prev) => ({ ...prev, ...updates }))
  }

  const applyTheme = (theme: ProfileTheme) => {
    updateProfile({
      theme_primary_color: theme.primary_color,
      theme_secondary_color: theme.secondary_color,
      theme_accent_color: theme.accent_color,
      theme_background_color: theme.background_color,
      theme_text_color: theme.text_color,
      background_image: theme.background_image,
      background_pattern: theme.background_pattern,
      custom_css: theme.custom_css,
    })
  }

  const addWidget = (type: ProfileWidget["type"]) => {
    const newWidget: ProfileWidget = {
      type,
      enabled: true,
      order: customProfile.profile_widgets.length + 1,
      config: {},
    }
    updateProfile({
      profile_widgets: [...customProfile.profile_widgets, newWidget],
    })
  }

  const updateWidget = (index: number, updates: Partial<ProfileWidget>) => {
    const updatedWidgets = [...customProfile.profile_widgets]
    updatedWidgets[index] = { ...updatedWidgets[index], ...updates }
    updateProfile({ profile_widgets: updatedWidgets })
  }

  const removeWidget = (index: number) => {
    const updatedWidgets = customProfile.profile_widgets.filter((_, i) => i !== index)
    updateProfile({ profile_widgets: updatedWidgets })
  }

  const addSocialLink = (platform: string, url: string) => {
    updateProfile({
      social_links: { ...customProfile.social_links, [platform]: url },
    })
  }

  const removeSocialLink = (platform: string) => {
    const { [platform]: removed, ...rest } = customProfile.social_links
    updateProfile({ social_links: rest })
  }

  const handleSave = () => {
    onSave(customProfile)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen">
      {/* Customizer Panel */}
      <div className="space-y-6 overflow-y-auto p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Customize Your Profile</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="theme">
              <Palette className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="media">
              <ImageIcon className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="widgets">
              <Sparkles className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="social">
              <Link className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Code className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Theme</CardTitle>
                <CardDescription>Choose from preset themes or create your own</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <Card
                      key={theme.id}
                      className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => applyTheme(theme)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary_color }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary_color }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent_color }} />
                        </div>
                        <h4 className="font-medium">{theme.name}</h4>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                        {theme.is_premium && <Badge variant="secondary">Premium</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Custom Colors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customProfile.theme_primary_color}
                          onChange={(e) => updateProfile({ theme_primary_color: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={customProfile.theme_primary_color}
                          onChange={(e) => updateProfile({ theme_primary_color: e.target.value })}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customProfile.theme_secondary_color}
                          onChange={(e) => updateProfile({ theme_secondary_color: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={customProfile.theme_secondary_color}
                          onChange={(e) => updateProfile({ theme_secondary_color: e.target.value })}
                          placeholder="#1e40af"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customProfile.theme_accent_color}
                          onChange={(e) => updateProfile({ theme_accent_color: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={customProfile.theme_accent_color}
                          onChange={(e) => updateProfile({ theme_accent_color: e.target.value })}
                          placeholder="#f59e0b"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customProfile.theme_background_color}
                          onChange={(e) => updateProfile({ theme_background_color: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={customProfile.theme_background_color}
                          onChange={(e) => updateProfile({ theme_background_color: e.target.value })}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Style</CardTitle>
                <CardDescription>Choose how your profile is organized</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={customProfile.layout_style}
                  onValueChange={(value) => updateProfile({ layout_style: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern Grid</SelectItem>
                    <SelectItem value="classic">Classic List</SelectItem>
                    <SelectItem value="magazine">Magazine Style</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="creative">Creative Chaos</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Media</CardTitle>
                <CardDescription>Add images and music to your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Banner Image URL</Label>
                  <Input
                    value={customProfile.banner_image || ""}
                    onChange={(e) => updateProfile({ banner_image: e.target.value })}
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
                <div>
                  <Label>Background Image URL</Label>
                  <Input
                    value={customProfile.background_image || ""}
                    onChange={(e) => updateProfile({ background_image: e.target.value })}
                    placeholder="https://example.com/background.jpg"
                  />
                </div>
                <div>
                  <Label>Background Pattern</Label>
                  <Select
                    value={customProfile.background_pattern || "none"}
                    onValueChange={(value) => updateProfile({ background_pattern: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="waves">Waves</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="leaves">Leaves</SelectItem>
                      <SelectItem value="stars">Stars</SelectItem>
                      <SelectItem value="circuit">Circuit</SelectItem>
                      <SelectItem value="marble">Marble</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="retro">Retro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Profile Music (Spotify/YouTube URL)</Label>
                  <Input
                    value={customProfile.profile_music || ""}
                    onChange={(e) => updateProfile({ profile_music: e.target.value })}
                    placeholder="https://open.spotify.com/track/..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Widgets Tab */}
          <TabsContent value="widgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Widgets</CardTitle>
                <CardDescription>Add and organize sections on your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => addWidget("bio")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Bio
                  </Button>
                  <Button size="sm" onClick={() => addWidget("stats")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Stats
                  </Button>
                  <Button size="sm" onClick={() => addWidget("recent_posts")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Recent Posts
                  </Button>
                  <Button size="sm" onClick={() => addWidget("music_player")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Music Player
                  </Button>
                  <Button size="sm" onClick={() => addWidget("custom_html")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Custom HTML
                  </Button>
                </div>

                <div className="space-y-2">
                  {customProfile.profile_widgets.map((widget, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium capitalize">{widget.type.replace("_", " ")}</span>
                            <Switch
                              checked={widget.enabled}
                              onCheckedChange={(enabled) => updateWidget(index, { enabled })}
                            />
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeWidget(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Add links to your other social profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(customProfile.social_links).map(([platform, url]) => (
                  <div key={platform} className="flex gap-2">
                    <Input value={platform} disabled className="w-32" />
                    <Input value={url} onChange={(e) => addSocialLink(platform, e.target.value)} placeholder="URL" />
                    <Button size="sm" variant="ghost" onClick={() => removeSocialLink(platform)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input placeholder="Platform (e.g., Twitter)" id="new-platform" />
                  <Input placeholder="URL" id="new-url" />
                  <Button
                    size="sm"
                    onClick={() => {
                      const platform = (document.getElementById("new-platform") as HTMLInputElement)?.value
                      const url = (document.getElementById("new-url") as HTMLInputElement)?.value
                      if (platform && url) {
                        addSocialLink(platform, url)
                        ;(document.getElementById("new-platform") as HTMLInputElement).value = ""
                        ;(document.getElementById("new-url") as HTMLInputElement).value = ""
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Customization</CardTitle>
                <CardDescription>Add custom CSS and HTML for ultimate control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Custom CSS</Label>
                  <Textarea
                    value={customProfile.custom_css || ""}
                    onChange={(e) => updateProfile({ custom_css: e.target.value })}
                    placeholder="/* Add your custom CSS here */"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>Custom Domain</Label>
                  <Input
                    value={customProfile.custom_domain || ""}
                    onChange={(e) => updateProfile({ custom_domain: e.target.value })}
                    placeholder="your-custom-domain.com"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={customProfile.is_profile_public}
                    onCheckedChange={(is_profile_public) => updateProfile({ is_profile_public })}
                  />
                  <Label>Make profile public</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Live Preview */}
      <div className="bg-muted/30 p-6 overflow-y-auto">
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Live Preview</h3>
          <p className="text-sm text-muted-foreground">See how your profile will look to visitors</p>
        </div>

        <ProfilePreview profile={customProfile} />
      </div>
    </div>
  )
}

function ProfilePreview({ profile }: { profile: Profile }) {
  const profileStyle = {
    "--primary": profile.theme_primary_color,
    "--secondary": profile.theme_secondary_color,
    "--accent": profile.theme_accent_color,
    "--background": profile.theme_background_color,
    "--text": profile.theme_text_color,
    backgroundImage: profile.background_image ? `url(${profile.background_image})` : undefined,
    backgroundColor: profile.theme_background_color,
    color: profile.theme_text_color,
  } as React.CSSProperties

  return (
    <div className="rounded-lg overflow-hidden shadow-lg" style={profileStyle}>
      {/* Custom CSS */}
      {profile.custom_css && <style dangerouslySetInnerHTML={{ __html: profile.custom_css }} />}

      {/* Banner */}
      {profile.banner_image && (
        <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${profile.banner_image})` }} />
      )}

      {/* Profile Header */}
      <div className="p-6 relative">
        <div className="flex items-start gap-4">
          <img
            src={profile.avatar_url || "/placeholder.svg"}
            alt={profile.display_name}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: profile.theme_text_color }}>
              {profile.display_name}
            </h1>
            <p className="text-lg opacity-80">@{profile.username}</p>
            {profile.bio && <p className="mt-2 opacity-90">{profile.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: profile.theme_primary_color }}>
              {profile.posts_count}
            </div>
            <div className="text-sm opacity-80">Posts</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: profile.theme_primary_color }}>
              {profile.followers_count}
            </div>
            <div className="text-sm opacity-80">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: profile.theme_primary_color }}>
              {profile.following_count}
            </div>
            <div className="text-sm opacity-80">Following</div>
          </div>
        </div>

        {/* Social Links */}
        {Object.keys(profile.social_links).length > 0 && (
          <div className="flex gap-2 mt-4">
            {Object.entries(profile.social_links).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                className="px-3 py-1 rounded-full text-sm border"
                style={{
                  borderColor: profile.theme_primary_color,
                  color: profile.theme_primary_color,
                }}
              >
                {platform}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Widgets */}
      <div className="p-6 space-y-6">
        {profile.profile_widgets
          .filter((w) => w.enabled)
          .sort((a, b) => a.order - b.order)
          .map((widget, index) => (
            <div key={index} className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <h3 className="font-semibold mb-2 capitalize">{widget.type.replace("_", " ")}</h3>
              <div className="text-sm opacity-80">Widget content would appear here</div>
            </div>
          ))}
      </div>
    </div>
  )
}
