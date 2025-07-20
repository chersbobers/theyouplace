export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string
  banner_image?: string
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
  profile_widgets: any[]
  social_links: any
  profile_music?: string
  created_at: string
  updated_at?: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  youtube_url?: string
  image_url?: string
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  updated_at?: string
  profiles: Profile
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
  sender: Profile
  receiver: Profile
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: "common" | "rare" | "epic" | "legendary"
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
