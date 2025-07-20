"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Star, Trophy, MessageCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import type { Profile } from "@/lib/types"

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const supabase = createClient()

    const getUsers = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_profile_public", true)
        .order("level", { ascending: false })
        .order("xp", { ascending: false })
        .limit(50)

      if (profiles) {
        setUsers(profiles)
        setFilteredUsers(profiles)
      }
      setLoading(false)
    }

    getUsers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Community</h1>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredUsers.length} members
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name, username, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || ""} alt={user.display_name} />
                  <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold truncate">{user.display_name}</h3>
                    {user.username === "chersbobers" && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">⭐</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.bio && <p className="text-sm text-gray-700 line-clamp-2">{user.bio}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Level {user.level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    {user.xp.toLocaleString()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="font-semibold text-blue-600">{user.posts_count}</div>
                  <div className="text-xs text-gray-500">Posts</div>
                </div>
                <div>
                  <div className="font-semibold text-green-600">{user.followers_count}</div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-600">{user.following_count}</div>
                  <div className="text-xs text-gray-500">Following</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link href={`/profile/${user.username}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Profile
                  </Button>
                </Link>
                <Link href={`/messages?user=${user.username}`}>
                  <Button size="sm" variant="ghost">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
