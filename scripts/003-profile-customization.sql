-- Add customization columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_primary_color TEXT DEFAULT '#3b82f6';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_secondary_color TEXT DEFAULT '#1e40af';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_accent_color TEXT DEFAULT '#f59e0b';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_background_color TEXT DEFAULT '#ffffff';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_text_color TEXT DEFAULT '#1f2937';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_image TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_pattern TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS layout_style TEXT DEFAULT 'modern';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_css TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_widgets JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_music TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_domain TEXT;

-- Create profile themes table for preset themes
CREATE TABLE IF NOT EXISTS public.profile_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  background_image TEXT,
  background_pattern TEXT,
  custom_css TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some preset themes
INSERT INTO public.profile_themes (name, description, primary_color, secondary_color, accent_color, background_color, text_color, background_pattern) VALUES
('Ocean Breeze', 'Cool blue ocean theme', '#0ea5e9', '#0284c7', '#06b6d4', '#f0f9ff', '#0c4a6e', 'waves'),
('Sunset Vibes', 'Warm sunset colors', '#f97316', '#ea580c', '#fbbf24', '#fff7ed', '#9a3412', 'gradient'),
('Forest Green', 'Natural green theme', '#16a34a', '#15803d', '#84cc16', '#f0fdf4', '#14532d', 'leaves'),
('Purple Dreams', 'Mystical purple theme', '#9333ea', '#7c3aed', '#c084fc', '#faf5ff', '#581c87', 'stars'),
('Neon Cyber', 'Futuristic neon theme', '#06ffa5', '#00d9ff', '#ff006e', '#0a0a0a', '#ffffff', 'circuit'),
('Rose Gold', 'Elegant rose gold theme', '#f43f5e', '#e11d48', '#fbbf24', '#fdf2f8', '#881337', 'marble'),
('Midnight Dark', 'Dark mode theme', '#6366f1', '#4f46e5', '#8b5cf6', '#111827', '#f9fafb', 'dark'),
('Retro Wave', '80s retro theme', '#ec4899', '#be185d', '#06b6d4', '#1e1b4b', '#fbbf24', 'retro');

-- Enable RLS for new tables
ALTER TABLE public.profile_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for themes
CREATE POLICY "Themes are viewable by everyone" ON public.profile_themes FOR SELECT USING (true);
CREATE POLICY "Users can create themes" ON public.profile_themes FOR INSERT WITH CHECK (auth.uid() = created_by);
