"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface BadgeDisplayProps {
  badges: Array<{
    id: string
    badges: {
      name: string
      description: string
      icon: string
      color: string
    }
    earned_at: string
  }>
}

export function BadgeDisplay({ badges }: BadgeDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Badges ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((userBadge) => (
            <div
              key={userBadge.id}
              className="text-center p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              title={userBadge.badges.description}
            >
              <div className="text-3xl mb-2">{userBadge.badges.icon}</div>
              <div className="font-medium text-sm">{userBadge.badges.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{userBadge.badges.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
