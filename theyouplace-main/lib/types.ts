export interface Profile {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  website?: string
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
  // Customization fields
  theme_primary_color: string
  theme_secondary_color: string
  theme_accent_color: string
  theme_background_color: string
  theme_text_color: string
  background_image?: string
  background_pattern?: string
  layout_style: string
  custom_css?: string
  banner_image?: string
  profile_widgets: ProfileWidget[]
  social_links: Record<string, string>
  profile_music?: string
  is_profile_public: boolean
  custom_domain?: string
}

export interface ProfileWidget {
  type: "bio" | "stats" | "recent_posts" | "social_links" | "music_player" | "custom_html"
  enabled: boolean
  order: number
  config?: Record<string, any>
}

export interface ProfileTheme {
  id: string
  name: string
  description?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  background_image?: string
  background_pattern?: string
  custom_css?: string
  is_premium: boolean
  created_by?: string
  downloads_count: number
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  type: "text" | "video"
  content: string
  video_url?: string
  video_title?: string
  video_thumbnail?: string
  likes_count: number
  comments_count: number
  shares_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  profiles: Profile
  is_liked?: boolean
  is_bookmarked?: boolean
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  parent_id?: string
  likes_count: number
  created_at: string
  updated_at: string
  profiles: Profile
  replies?: Comment[]
}

export interface Hashtag {
  id: string
  name: string
  posts_count: number
  created_at: string
}
