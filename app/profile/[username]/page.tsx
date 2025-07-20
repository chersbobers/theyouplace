import { createClient } from "@/lib/supabase-server"
import { getUser } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/post-card"
import { Settings, Share, UserPlus, Music, MessageCircle, Palette } from "lucide-react"
import Link from "next/link"
import type { Profile, Post } from "@/lib/types"

async function getProfileByUsername(username: string): Promise<Profile | null> {
  try {
    const supabase = await createClient()

    const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

    return profile
  } catch (error) {
    console.error("Error fetching profile:", error)
    return null
  }
}

async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const supabase = await createClient()

    const { data: posts } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          id,
          username,
          display_name,
          avatar_url,
          level,
          xp
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    return posts || []
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return []
  }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username)

  if (!profile) {
    notFound()
  }

  // Check if profile is public or if it's the user's own profile
  const user = await getUser()
  const isOwnProfile = user?.id === profile.id

  if (!profile.is_profile_public && !isOwnProfile) {
    notFound()
  }

  const posts = await getUserPosts(profile.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        {/* Banner */}
        {profile.banner_image && (
          <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${profile.banner_image})` }}>
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 md:-mt-12 relative">
            <Avatar className="w-32 h-32 border-4 border-white shadow-xl bg-white">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
              <AvatarFallback className="text-2xl">{profile.display_name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 pt-16 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{profile.display_name}</h1>
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="text-xl text-gray-600">@{profile.username}</p>
                    {profile.username === "chersbobers" && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">⭐ Creator</Badge>
                    )}
                  </div>
                  {profile.bio && <p className="text-lg text-gray-700 max-w-2xl">{profile.bio}</p>}
                </div>

                <div className="flex gap-2 mt-4 md:mt-0">
                  {isOwnProfile ? (
                    <>
                      <Link href="/settings">
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      <Link href="/customize">
                        <Button>
                          <Palette className="w-4 h-4 mr-2" />
                          Customize
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </Button>
                      <Link href={`/messages?user=${profile.username}`}>
                        <Button variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </Link>
                      <Button variant="outline">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.level}</div>
                  <div className="text-sm text-gray-500">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.xp.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{profile.posts_count}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{profile.followers_count}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
              </div>

              {/* Profile Music */}
              {profile.profile_music && (
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">
                    <Music className="w-3 h-3 mr-1" />
                    Now Playing
                  </Badge>
                  <div className="text-sm text-gray-600">{profile.profile_music}</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Posts ({posts.length})
            </CardTitle>
          </CardHeader>
        </Card>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-500">
                {isOwnProfile ? "Share your first post!" : `${profile.display_name} hasn't posted anything yet.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user?.id || null} />)
        )}
      </div>
    </div>
  )
}
