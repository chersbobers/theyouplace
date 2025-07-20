import { createClient } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Star, Trophy, MessageCircle } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/lib/types"

async function getUsers(): Promise<Profile[]> {
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_profile_public", true)
    .order("xp", { ascending: false })
    .limit(50)

  return profiles || []
}

async function getStats() {
  const supabase = await createClient()

  const [{ count: totalUsers }, { count: totalPosts }, { count: totalVideos }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).not("youtube_url", "is", null),
  ])

  return {
    users: totalUsers || 0,
    posts: totalPosts || 0,
    videos: totalVideos || 0,
  }
}

export default async function UsersPage() {
  const users = await getUsers()
  const stats = await getStats()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Users className="w-8 h-8 text-blue-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            The You Place Community
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Meet amazing people from around the world sharing their thoughts, videos, and creativity
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-3xl font-bold text-blue-600">{stats.users.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Community Members</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-3xl font-bold text-purple-600">{stats.posts.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Posts Shared</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-3xl font-bold text-yellow-600">{stats.videos.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Videos Posted</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.slice(0, 3).map((user, index) => (
              <Card key={user.id} className="relative overflow-hidden">
                {index === 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">👑 #1</Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-4">
                    <AvatarImage src={user.avatar_url || ""} alt={user.display_name} />
                    <AvatarFallback className="text-lg">{user.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{user.display_name}</h3>
                  <p className="text-gray-500 text-sm">@{user.username}</p>
                  {user.username === "chersbobers" && (
                    <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">⭐ Creator</Badge>
                  )}
                  <div className="flex items-center justify-center space-x-4 mt-4">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{user.level}</div>
                      <div className="text-xs text-gray-500">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{user.xp.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{user.posts_count}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                  </div>
                  <Link href={`/profile/${user.username}`}>
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Community Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar_url || ""} alt={user.display_name} />
                      <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{user.display_name}</h4>
                      <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />L{user.level}
                        </Badge>
                        {user.username === "chersbobers" && (
                          <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            ⭐
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm font-semibold">{user.xp}</div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{user.posts_count}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{user.followers_count}</div>
                      <div className="text-xs text-gray-500">Followers</div>
                    </div>
                  </div>
                  <Link href={`/profile/${user.username}`}>
                    <Button className="w-full mt-3 bg-transparent" variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
