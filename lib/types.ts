export interface Profile {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  banner_image?: string
  background_image?: string
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
  custom_css?: string
  profile_music?: string
  profile_widgets: ProfileWidget[]
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}

export interface ProfileWidget {
  type: string
  enabled: boolean
  order: number
}

export interface ProfileTheme {
  id: string
  name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  downloads_count: number
}

export interface Post {
  id: string
  user_id: string
  content?: string
  youtube_url?: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  profiles?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  likes_count: number
  created_at: string
  profiles?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  xp_required: number
  is_rare: boolean
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge: Badge
}
