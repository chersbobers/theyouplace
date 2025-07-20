-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  banner_image TEXT DEFAULT '',
  background_image TEXT DEFAULT '',
  profile_music TEXT DEFAULT '',
  custom_css TEXT DEFAULT '',
  theme_primary_color TEXT DEFAULT '#3b82f6',
  theme_secondary_color TEXT DEFAULT '#64748b',
  theme_accent_color TEXT DEFAULT '#f59e0b',
  theme_background_color TEXT DEFAULT '#ffffff',
  theme_text_color TEXT DEFAULT '#1f2937',
  social_links JSONB DEFAULT '{}',
  profile_widgets JSONB DEFAULT '[
    {"type": "bio", "enabled": true, "order": 1},
    {"type": "stats", "enabled": true, "order": 2},
    {"type": "recent_posts", "enabled": true, "order": 3}
  ]',
  is_profile_public BOOLEAN DEFAULT true,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  youtube_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_bookmarks table
CREATE TABLE IF NOT EXISTS post_bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  xp_required INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create profile_themes table
CREATE TABLE IF NOT EXISTS profile_themes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default badges
INSERT INTO badges (name, description, icon, color, xp_required) VALUES
('Welcome', 'Joined the community', '👋', '#10b981', 0),
('First Post', 'Created your first post', '📝', '#3b82f6', 10),
('Social Butterfly', 'Made 10 posts', '🦋', '#8b5cf6', 100),
('Video Lover', 'Shared 5 YouTube videos', '🎥', '#ef4444', 50),
('Commenter', 'Made 25 comments', '💬', '#f59e0b', 75),
('Popular', 'Got 50 likes on posts', '⭐', '#ec4899', 150),
('Influencer', 'Reached level 10', '👑', '#fbbf24', 500)
ON CONFLICT DO NOTHING;

-- Insert default themes
INSERT INTO profile_themes (name, description, primary_color, secondary_color, accent_color, background_color, text_color) VALUES
('Ocean Blue', 'Cool ocean vibes', '#0ea5e9', '#64748b', '#06b6d4', '#f8fafc', '#1e293b'),
('Forest Green', 'Nature inspired', '#10b981', '#6b7280', '#34d399', '#f9fafb', '#111827'),
('Sunset Orange', 'Warm sunset colors', '#f97316', '#78716c', '#fb923c', '#fffbeb', '#1c1917'),
('Purple Dream', 'Mystical purple theme', '#8b5cf6', '#6b7280', '#a78bfa', '#faf5ff', '#1f2937'),
('Rose Gold', 'Elegant rose gold', '#ec4899', '#9ca3af', '#f472b6', '#fdf2f8', '#374151')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id ON post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Public read, users can update their own
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts: Public read, authenticated users can create, users can update/delete their own
CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Post likes: Public read, authenticated users can like
CREATE POLICY "Post likes are publicly readable" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can unlike their own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post comments: Public read, authenticated users can comment
CREATE POLICY "Post comments are publicly readable" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON post_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments" ON post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- Post bookmarks: Users can only see and manage their own
CREATE POLICY "Users can see their own bookmarks" ON post_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark posts" ON post_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their bookmarks" ON post_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Messages: Users can see messages they sent or received
CREATE POLICY "Users can see their messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- User badges: Public read, system manages
CREATE POLICY "User badges are publicly readable" ON user_badges FOR SELECT USING (true);

-- Functions to update counts
CREATE OR REPLACE FUNCTION update_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET posts_count = posts_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for posts count
DROP TRIGGER IF EXISTS trigger_update_posts_count ON posts;
CREATE TRIGGER trigger_update_posts_count
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_count();

-- Function to calculate XP and level
CREATE OR REPLACE FUNCTION update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  -- Award XP for different actions
  IF TG_TABLE_NAME = 'posts' AND TG_OP = 'INSERT' THEN
    UPDATE profiles SET xp = xp + 10 WHERE id = NEW.user_id;
  ELSIF TG_TABLE_NAME = 'post_comments' AND TG_OP = 'INSERT' THEN
    UPDATE profiles SET xp = xp + 5 WHERE id = NEW.user_id;
  ELSIF TG_TABLE_NAME = 'post_likes' AND TG_OP = 'INSERT' THEN
    UPDATE profiles SET xp = xp + 2 WHERE id = NEW.user_id;
  END IF;
  
  -- Update level based on XP
  UPDATE profiles 
  SET level = GREATEST(1, FLOOR(xp / 100) + 1)
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for XP
DROP TRIGGER IF EXISTS trigger_posts_xp ON posts;
CREATE TRIGGER trigger_posts_xp
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_xp();

DROP TRIGGER IF EXISTS trigger_comments_xp ON post_comments;
CREATE TRIGGER trigger_comments_xp
  AFTER INSERT ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_user_xp();

DROP TRIGGER IF EXISTS trigger_likes_xp ON post_likes;
CREATE TRIGGER trigger_likes_xp
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_user_xp();

-- Function to auto-award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  user_xp INTEGER;
  user_posts INTEGER;
BEGIN
  -- Get current user stats
  SELECT xp, posts_count INTO user_xp, user_posts
  FROM profiles WHERE id = NEW.user_id;
  
  -- Award badges based on criteria
  -- Welcome badge (automatic)
  INSERT INTO user_badges (user_id, badge_id)
  SELECT NEW.user_id, id FROM badges WHERE name = 'Welcome'
  ON CONFLICT DO NOTHING;
  
  -- First Post badge
  IF user_posts >= 1 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT NEW.user_id, id FROM badges WHERE name = 'First Post'
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Social Butterfly badge
  IF user_posts >= 10 THEN
    INSERT INTO user_badges (user_id, badge_id)
    SELECT NEW.user_id, id FROM badges WHERE name = 'Social Butterfly'
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for badge awarding
DROP TRIGGER IF EXISTS trigger_award_badges ON posts;
CREATE TRIGGER trigger_award_badges
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();
