import { createServerClient } from "@/lib/supabase-server"
import { AuthForm } from "@/components/auth-form"
import { PostCard } from "@/components/post-card"
import { CreatePost } from "@/components/create-post"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Video, LogOut, Trophy, Star } from "lucide-react"
import { signOut } from "@/app/actions/auth"

async function getPosts(userId?: string) {
  const supabase = createServerClient()
  const { data: posts } = await supabase
    .from("posts")
    .select(`*, profiles(username, display_name, avatar_url)`)
    .order("created_at", { ascending: false })

  if (!posts) return []

  if (userId) {
    const { data: likes } = await supabase.from("likes").select("post_id").eq("user_id", userId)
    const likedPostIds = new Set(likes?.map((l) => l.post_id) || [])
    return posts.map((post) => ({ ...post, is_liked: likedPostIds.has(post.id) }))
  }

  return posts
}

async function getUserBadges(userId: string) {
  const supabase = createServerClient()
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select(`
      *,
      badges (
        name,
        description,
        icon,
        color
      )
    `)
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })

  return userBadges || []
}

export default async function Home() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <AuthForm />

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const posts = await getPosts(user.id)
  const userBadges = await getUserBadges(user.id)

  // Calculate XP progress to next level
  const currentLevelXP = (profile?.level - 1) * 1000
  const nextLevelXP = profile?.level * 1000
  const progressXP = profile?.xp - currentLevelXP
  const neededXP = nextLevelXP - currentLevelXP
  const progressPercent = (progressXP / neededXP) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">VidSocial</h1>
          </div>
          <div className="flex items-center gap-4">
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="w-5 h-5" />
              </Button>
            </form>
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{profile?.display_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{profile?.display_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{profile?.display_name}</h3>
                    <p className="text-sm text-muted-foreground">@{profile?.username}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Level {profile?.level}</span>
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>XP Progress</span>
                    <span>
                      {progressXP}/{neededXP}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="font-semibold">{profile?.posts_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div>
                    <p className="font-semibold">{profile?.followers_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="font-semibold">{profile?.xp || 0}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold">Badges ({userBadges.length})</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {userBadges.slice(0, 6).map((userBadge: any) => (
                    <div
                      key={userBadge.id}
                      className="text-center p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                      title={userBadge.badges.description}
                    >
                      <div className="text-2xl mb-1">{userBadge.badges.icon}</div>
                      <div className="text-xs font-medium truncate">{userBadge.badges.name}</div>
                    </div>
                  ))}
                </div>
                {userBadges.length > 6 && (
                  <p className="text-sm text-muted-foreground text-center mt-2">+{userBadges.length - 6} more</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost />

            {/* Posts */}
            <div className="space-y-6">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} currentUserId={user.id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
