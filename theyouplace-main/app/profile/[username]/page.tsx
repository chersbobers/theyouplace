import type React from "react"
import { createServerClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/post-card"
import { Settings, Share, UserPlus, Music } from "lucide-react"
import Link from "next/link"
import type { Profile, Post } from "@/lib/types"

async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = createServerClient()

  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) return null

  return {
    ...profile,
    profile_widgets:
      typeof profile.profile_widgets === "string" ? JSON.parse(profile.profile_widgets) : profile.profile_widgets || [],
    social_links:
      typeof profile.social_links === "string" ? JSON.parse(profile.social_links) : profile.social_links || {},
  }
}

async function getUserPosts(userId: string): Promise<Post[]> {
  const supabase = createServerClient()

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return posts || []
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username)

  if (!profile || !profile.is_profile_public) {
    notFound()
  }

  const posts = await getUserPosts(profile.id)

  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

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
    <div className="min-h-screen" style={profileStyle}>
      {/* Custom CSS */}
      {profile.custom_css && <style dangerouslySetInnerHTML={{ __html: profile.custom_css }} />}

      {/* Banner */}
      {profile.banner_image && (
        <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${profile.banner_image})` }}>
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <Card
            className="p-6"
            style={{ backgroundColor: `${profile.theme_background_color}ee`, backdropFilter: "blur(10px)" }}
          >
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{profile.display_name[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: profile.theme_text_color }}>
                      {profile.display_name}
                    </h1>
                    <p className="text-xl opacity-80 mb-2">@{profile.username}</p>
                    {profile.bio && <p className="text-lg opacity-90 max-w-2xl">{profile.bio}</p>}
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    {isOwnProfile ? (
                      <Link href="/customize">
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Customize
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Button style={{ backgroundColor: profile.theme_primary_color }}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </Button>
                        <Button variant="outline">
                          <Share className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: profile.theme_primary_color }}>
                      {profile.posts_count.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-80">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: profile.theme_primary_color }}>
                      {profile.followers_count.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-80">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: profile.theme_primary_color }}>
                      {profile.following_count.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-80">Following</div>
                  </div>
                </div>

                {/* Social Links */}
                {Object.keys(profile.social_links).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(profile.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full text-sm border-2 hover:bg-opacity-10 transition-all"
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

                {/* Profile Music */}
                {profile.profile_music && (
                  <div className="mb-4">
                    <Badge variant="secondary" className="mb-2">
                      <Music className="w-3 h-3 mr-1" />
                      Now Playing
                    </Badge>
                    <div className="text-sm opacity-80">{profile.profile_music}</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {profile.profile_widgets
            .filter((w) => w.enabled)
            .sort((a, b) => a.order - b.order)
            .map((widget, index) => (
              <Card key={index} style={{ backgroundColor: `${profile.theme_background_color}cc` }}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 capitalize text-lg" style={{ color: profile.theme_primary_color }}>
                    {widget.type.replace("_", " ")}
                  </h3>
                  <div className="space-y-2">
                    {widget.type === "bio" && profile.bio && (
                      <p style={{ color: profile.theme_text_color }}>{profile.bio}</p>
                    )}
                    {widget.type === "stats" && (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-bold" style={{ color: profile.theme_primary_color }}>
                            {profile.posts_count}
                          </div>
                          <div className="text-xs opacity-80">Posts</div>
                        </div>
                        <div>
                          <div className="font-bold" style={{ color: profile.theme_primary_color }}>
                            {profile.followers_count}
                          </div>
                          <div className="text-xs opacity-80">Followers</div>
                        </div>
                        <div>
                          <div className="font-bold" style={{ color: profile.theme_primary_color }}>
                            {profile.following_count}
                          </div>
                          <div className="text-xs opacity-80">Following</div>
                        </div>
                      </div>
                    )}
                    {widget.type === "recent_posts" && (
                      <div className="text-sm opacity-80">Latest posts will appear here</div>
                    )}
                    {widget.type === "social_links" && Object.keys(profile.social_links).length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(profile.social_links).map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm hover:underline"
                            style={{ color: profile.theme_primary_color }}
                          >
                            {platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold" style={{ color: profile.theme_text_color }}>
            Posts
          </h2>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} />
          ))}
        </div>
      </div>
    </div>
  )
}
