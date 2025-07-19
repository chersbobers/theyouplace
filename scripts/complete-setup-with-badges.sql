-- Complete setup with badges system
-- Just copy-paste this entire thing into Supabase SQL Editor and click RUN

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  theme_primary_color TEXT DEFAULT '#3b82f6',
  theme_secondary_color TEXT DEFAULT '#1e40af',
  theme_background_color TEXT DEFAULT '#ffffff',
  social_links JSONB DEFAULT '{}',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('text', 'video')) NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  video_title TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  requirement_type TEXT NOT NULL, -- 'posts', 'likes', 'followers', 'days'
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, color, requirement_type, requirement_value, xp_reward) VALUES
('First Post', 'Created your first post', '🎉', '#10b981', 'posts', 1, 50),
('Getting Started', 'Posted 5 times', '🚀', '#3b82f6', 'posts', 5, 100),
('Content Creator', 'Posted 25 times', '✨', '#8b5cf6', 'posts', 25, 250),
('Influencer', 'Posted 100 times', '👑', '#f59e0b', 'posts', 100, 500),
('Popular', 'Got 10 likes', '❤️', '#ef4444', 'likes', 10, 100),
('Viral', 'Got 100 likes', '🔥', '#f97316', 'likes', 100, 300),
('Social Butterfly', 'Got 10 followers', '🦋', '#06b6d4', 'followers', 10, 200),
('Community Leader', 'Got 100 followers', '🏆', '#eab308', 'followers', 100, 500),
('Veteran', 'Been here 30 days', '⭐', '#6366f1', 'days', 30, 300),
('Legend', 'Been here 365 days', '💎', '#a855f7', 'days', 365, 1000);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Public user badges" ON public.user_badges FOR SELECT USING (true);

-- Functions for XP and badges
CREATE OR REPLACE FUNCTION award_xp_and_badges(user_id UUID, action_type TEXT)
RETURNS VOID AS $$
DECLARE
  current_posts INTEGER;
  current_likes INTEGER;
  current_followers INTEGER;
  account_days INTEGER;
  badge_record RECORD;
BEGIN
  -- Get current stats
  SELECT posts_count, followers_count INTO current_posts, current_followers
  FROM public.profiles WHERE id = user_id;
  
  SELECT COUNT(*) INTO current_likes
  FROM public.likes l
  JOIN public.posts p ON l.post_id = p.id
  WHERE p.user_id = user_id;
  
  SELECT EXTRACT(DAY FROM NOW() - created_at) INTO account_days
  FROM public.profiles WHERE id = user_id;

  -- Check for new badges
  FOR badge_record IN 
    SELECT b.* FROM public.badges b
    WHERE b.id NOT IN (SELECT badge_id FROM public.user_badges WHERE user_badges.user_id = award_xp_and_badges.user_id)
  LOOP
    IF (badge_record.requirement_type = 'posts' AND current_posts >= badge_record.requirement_value) OR
       (badge_record.requirement_type = 'likes' AND current_likes >= badge_record.requirement_value) OR
       (badge_record.requirement_type = 'followers' AND current_followers >= badge_record.requirement_value) OR
       (badge_record.requirement_type = 'days' AND account_days >= badge_record.requirement_value) THEN
      
      -- Award badge
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (user_id, badge_record.id);
      
      -- Award XP
      UPDATE public.profiles 
      SET xp = xp + badge_record.xp_reward,
          level = GREATEST(1, (xp + badge_record.xp_reward) / 1000 + 1)
      WHERE id = user_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating counts and awarding badges
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    -- Award XP and check badges for post owner
    PERFORM award_xp_and_badges((SELECT user_id FROM public.posts WHERE id = NEW.post_id), 'like_received');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
    -- Award XP and check badges
    PERFORM award_xp_and_badges(NEW.user_id, 'post_created');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET posts_count = posts_count - 1 WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_likes_count_trigger ON public.likes;
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

DROP TRIGGER IF EXISTS update_posts_count_trigger ON public.posts;
CREATE TRIGGER update_posts_count_trigger
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_count();

DROP TRIGGER IF EXISTS update_comments_count_trigger ON public.comments;
CREATE TRIGGER update_comments_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();
