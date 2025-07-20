export interface User {
  id: string
  email: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  xp: number
  level: number
  posts_count: number
  followers_count: number
  following_count: number
  is_profile_public: boolean
  theme_primary_color: string
  theme_secondary_color: string
  theme_accent_color: string
  theme_background_color: string
  theme_text_color: string
  profile_widgets: any
  social_links: any
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  media_url?: string
  media_type?: string
  youtube_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  user: User
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  user: User
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: string
  requirements: any
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge: Badge
}
