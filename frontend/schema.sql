CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL,
  episode_video_id TEXT,
  episode_title TEXT,
  episode_url TEXT,
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_video ON posts(episode_video_id);
