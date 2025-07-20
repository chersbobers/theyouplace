-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  banner_image TEXT,
  background_image TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  is_profile_public BOOLEAN DEFAULT true,
  theme_primary_color TEXT DEFAULT '#3b82f6',
  theme_secondary_color TEXT DEFAULT '#64748b',
  theme_accent_color TEXT DEFAULT '#f59e0b',
  theme_background_color TEXT DEFAULT '#ffffff',
  theme_text_color TEXT DEFAULT '#1f2937',
  custom_css TEXT,
  profile_music TEXT,
  profile_widgets JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  youtube_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
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

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
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
  is_rare BOOLEAN DEFAULT false,
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
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Public read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts: Public read, authenticated users can create
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments: Public read, authenticated users can create
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes: Users can manage their own likes
CREATE POLICY "Users can view all post likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own post likes" ON post_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own comment likes" ON comment_likes FOR ALL USING (auth.uid() = user_id);

-- Messages: Users can see messages they sent or received
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- User badges: Public read, system manages
CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);

-- Badges: Public read
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);

-- Profile themes: Public read
CREATE POLICY "Profile themes are viewable by everyone" ON profile_themes FOR SELECT USING (true);

-- Functions to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update post counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update user posts count
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET posts_count = posts_count - 1 WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to award XP and check for level ups
CREATE OR REPLACE FUNCTION award_xp(user_id UUID, xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  new_level INTEGER;
BEGIN
  -- Update XP
  UPDATE profiles 
  SET xp = xp + xp_amount, updated_at = NOW()
  WHERE id = user_id
  RETURNING xp, level INTO current_xp, current_level;
  
  -- Calculate new level (every 100 XP = 1 level)
  new_level := (current_xp / 100) + 1;
  
  -- Update level if changed
  IF new_level > current_level THEN
    UPDATE profiles SET level = new_level WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically award XP for actions
CREATE OR REPLACE FUNCTION auto_award_xp()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'posts' AND TG_OP = 'INSERT' THEN
    PERFORM award_xp(NEW.user_id, 10); -- 10 XP for creating a post
  ELSIF TG_TABLE_NAME = 'comments' AND TG_OP = 'INSERT' THEN
    PERFORM award_xp(NEW.user_id, 5); -- 5 XP for commenting
  ELSIF TG_TABLE_NAME = 'post_likes' AND TG_OP = 'INSERT' THEN
    PERFORM award_xp(NEW.user_id, 1); -- 1 XP for liking
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS post_likes_count_trigger ON post_likes;
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS post_comments_count_trigger ON comments;
CREATE TRIGGER post_comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS comment_likes_count_trigger ON comment_likes;
CREATE TRIGGER comment_likes_count_trigger
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

DROP TRIGGER IF EXISTS user_posts_count_trigger ON posts;
CREATE TRIGGER user_posts_count_trigger
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_user_posts_count();

DROP TRIGGER IF EXISTS auto_xp_posts_trigger ON posts;
CREATE TRIGGER auto_xp_posts_trigger
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION auto_award_xp();

DROP TRIGGER IF EXISTS auto_xp_comments_trigger ON comments;
CREATE TRIGGER auto_xp_comments_trigger
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION auto_award_xp();

DROP TRIGGER IF EXISTS auto_xp_likes_trigger ON post_likes;
CREATE TRIGGER auto_xp_likes_trigger
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION auto_award_xp();

-- Insert some default badges
INSERT INTO badges (name, description, icon, color, xp_required, is_rare) VALUES
('Welcome', 'Joined the community', '👋', '#3b82f6', 0, false),
('First Post', 'Created your first post', '📝', '#10b981', 10, false),
('Socializer', 'Made 10 comments', '💬', '#f59e0b', 50, false),
('Popular', 'Got 50 likes on posts', '❤️', '#ef4444', 100, false),
('Content Creator', 'Posted 25 times', '🎬', '#8b5cf6', 250, false),
('Community Leader', 'Reached level 10', '👑', '#f59e0b', 1000, true),
('Legendary', 'Reached level 25', '⭐', '#fbbf24', 2500, true)
ON CONFLICT (name) DO NOTHING;

-- Insert some default profile themes
INSERT INTO profile_themes (name, primary_color, secondary_color, accent_color, background_color, text_color) VALUES
('Default Blue', '#3b82f6', '#64748b', '#f59e0b', '#ffffff', '#1f2937'),
('Dark Mode', '#6366f1', '#9ca3af', '#fbbf24', '#111827', '#f9fafb'),
('Sunset', '#f97316', '#ef4444', '#fbbf24', '#fef3c7', '#92400e'),
('Ocean', '#0ea5e9', '#06b6d4', '#10b981', '#e0f2fe', '#0c4a6e'),
('Forest', '#10b981', '#059669', '#84cc16', '#ecfdf5', '#064e3b'),
('Purple Dream', '#8b5cf6', '#a855f7', '#ec4899', '#faf5ff', '#581c87')
ON CONFLICT (name) DO NOTHING;
