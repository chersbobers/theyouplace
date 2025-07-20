export interface User {
  id: string
  email: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  banner_url?: string
  theme?: string
  custom_css?: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  video_url?: string
  image_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user?: User
  liked_by_user?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user?: User
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender?: User
  receiver?: User
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: "common" | "rare" | "epic" | "legendary"
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}
