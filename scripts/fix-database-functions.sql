-- Create or replace function to increment user stats
CREATE OR REPLACE FUNCTION increment_user_stats(
  user_id UUID,
  posts_increment INTEGER DEFAULT 0,
  xp_increment INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET 
    posts_count = COALESCE(posts_count, 0) + posts_increment,
    xp = COALESCE(xp, 0) + xp_increment,
    level = GREATEST(1, FLOOR((COALESCE(xp, 0) + xp_increment) / 1000) + 1)
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update likes count
  IF TG_TABLE_NAME = 'likes' THEN
    UPDATE posts 
    SET likes_count = (
      SELECT COUNT(*) FROM likes WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  END IF;

  -- Update comments count
  IF TG_TABLE_NAME = 'comments' THEN
    UPDATE posts 
    SET comments_count = (
      SELECT COUNT(*) FROM comments WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating counts
DROP TRIGGER IF EXISTS update_likes_count ON likes;
CREATE TRIGGER update_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS update_comments_count ON comments;
CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_counts();

-- Add missing columns if they don't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Update existing counts
UPDATE posts SET likes_count = (
  SELECT COUNT(*) FROM likes WHERE post_id = posts.id
);

UPDATE posts SET comments_count = (
  SELECT COUNT(*) FROM comments WHERE post_id = posts.id
);
