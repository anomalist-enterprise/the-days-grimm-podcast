const express = require('express');
const axios = require('axios');
const { parseString } = require('xml2js');

const router = express.Router();

// Simple in-memory cache for Reddit results
const redditCache = new Map(); // key -> { ts: number, payload: any }
const BLOG_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Utility: pick the best available thumbnail from a Reddit post payload
const pickBestThumbnail = (d) => {
  const unescape = (u) => (typeof u === 'string' ? u.replace(/&amp;/g, '&') : u);
  const isImageUrl = (u) => typeof u === 'string' && /\.(jpg|jpeg|png|webp|gif)(?:\?|$)/i.test(u);

  // 1) preview -> original source
  try {
    const src = d?.preview?.images?.[0]?.source?.url;
    if (src) return unescape(src);
  } catch {}

  // 2) preview -> pick the largest resolution if available
  try {
    const resolutions = d?.preview?.images?.[0]?.resolutions || [];
    if (resolutions.length > 0) {
      return unescape(resolutions[resolutions.length - 1].url);
    }
  } catch {}

  // 3) gallery/media_metadata
  try {
    const galleryItems = d?.gallery_data?.items;
    const mediaMeta = d?.media_metadata;
    if (galleryItems && mediaMeta) {
      const firstId = galleryItems[0]?.media_id;
      const meta = firstId ? mediaMeta[firstId] : null;
      const source = meta?.s?.u || (Array.isArray(meta?.p) ? meta.p[meta.p.length - 1]?.u : null);
      if (source) return unescape(source);
    }
  } catch {}

  // 4) direct url if it's an image
  if (isImageUrl(d?.url_overridden_by_dest)) return unescape(d.url_overridden_by_dest);
  if (isImageUrl(d?.url)) return unescape(d.url);

  // 5) fallback to thumbnail if it's a valid external URL (Reddit uses keywords like 'self', 'default', 'nsfw' otherwise)
  const t = d?.thumbnail;
  if (t && /^https?:\/\//i.test(t) && !['self', 'default', 'nsfw', 'image', 'spoiler'].includes(String(t).toLowerCase())) {
    return unescape(t);
  }

  return null;
};

// Helper function to parse Reddit RSS feed
const parseRedditRSS = (xmlData) => {
  return new Promise((resolve, reject) => {
    parseString(xmlData, (err, result) => {
      if (err) return reject(err);
      
      try {
        const items = result?.feed?.entry || [];
        const parsedPosts = items.map(item => {
          const title = item.title?.[0] || '';
          const link = item.link?.[0]?.$.href || '';
          const author = item.author?.[0]?.name?.[0] || '';
          const updated = item.updated?.[0] || '';
          const content = item.content?.[0]?._ || item.content?.[0] || '';
          
          // Extract Reddit post ID from link
          const idMatch = link.match(/\/comments\/([a-z0-9]+)\//);
          const id = idMatch ? idMatch[1] : Math.random().toString(36).substr(2, 9);
          
          return {
            id,
            title: title.replace(/^r\/[^\/]+\s*-\s*/, ''), // Remove subreddit prefix
            selftext: content.replace(/<[^>]*>/g, '').substring(0, 500), // Strip HTML, limit length
            url: link,
            createdUtc: Math.floor(new Date(updated).getTime() / 1000),
            author,
            flair: null, // RSS doesn't include flair info
            thumbnail: null
          };
        });
        
        resolve(parsedPosts);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
};

// GET /api/blog/reddit
// Hybrid approach: tries RSS first, falls back to JSON API
// Returns a simplified, safe JSON payload for the frontend.
router.get('/reddit', async (req, res) => {
  try {
    const rawSubreddit = process.env.REDDIT_SUBREDDIT || '';
    const subreddit = rawSubreddit.replace(/^\/?r\//i, '').trim();
    const envFlair = process.env.REDDIT_REQUIRED_FLAIR || 'Official Blog';
    const envAuthor = process.env.REDDIT_ALLOWED_AUTHOR || '';
    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 25);

    // Allow query overrides for debugging/config without redeploying
    const requiredFlair = typeof req.query.flair === 'string' ? req.query.flair : envFlair;
    const allowedAuthor = typeof req.query.author === 'string' ? req.query.author : envAuthor;
    const debug = String(req.query.debug || '0') === '1';
    // Cache key includes config inputs that affect results
    const cacheKey = JSON.stringify({ subreddit, requiredFlair, allowedAuthor, limit });
    const cached = redditCache.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < BLOG_CACHE_TTL) {
      res.set('Cache-Control', `public, max-age=${Math.floor(BLOG_CACHE_TTL / 1000)}`);
      return res.json(cached.payload);
    }

    if (!subreddit) {
      return res.status(400).json({
        error: 'Missing configuration',
        message: 'REDDIT_SUBREDDIT is not configured on the server',
        posts: []
      });
    }

    let posts = [];
    let apiMethod = 'unknown';

    // For author/flair filtering, try JSON API first (has thumbnails)
    // Otherwise use RSS first (faster for general content)
    if (allowedAuthor || requiredFlair) {
      try {
        let jsonUrl;
        if (requiredFlair) {
          const encodedFlair = encodeURIComponent(`flair_name:"${requiredFlair}"`);
          jsonUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodedFlair}&restrict_sr=1&sort=new&limit=${limit}`;
        } else {
          jsonUrl = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
        }

        const jsonResponse = await axios.get(jsonUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TheDaysGrimmPodcast/1.0; +https://www.thedaysgrimm.com)',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000,
          validateStatus: (status) => status < 500
        });

        const children = jsonResponse?.data?.data?.children || [];
        
        const afterFlair = children
          .map((child) => child.data)
          .filter((d) => !!d)
          .filter((d) => {
            // Flair filtering
            const flairName = d.link_flair_text || d.author_flair_text || '';
            if (requiredFlair && !String(flairName).toLowerCase().includes(String(requiredFlair).toLowerCase())) {
              return false;
            }
            // Author filtering (normalize /u/ prefix)
            const normalizeUsername = (username) => {
              if (!username) return '';
              return String(username).replace(/^\/u\//i, '').toLowerCase();
            };
            if (allowedAuthor && normalizeUsername(d.author) !== normalizeUsername(allowedAuthor)) {
              return false;
            }
            return true;
          });

        posts = afterFlair
          .map((d) => ({
            id: d.id,
            title: d.title || '',
            selftext: d.selftext || '',
            url: d.url || `https://reddit.com${d.permalink}`,
            createdUtc: d.created_utc || 0,
            author: d.author || '',
            flair: d.link_flair_text || d.author_flair_text || null,
            thumbnail: pickBestThumbnail(d)
          }))
          .slice(0, limit);
          
        apiMethod = 'JSON';
        
      } catch (jsonError) {
        // JSON failed, fall back to RSS
        console.log('JSON API failed for filtered request, falling back to RSS:', jsonError.message);
      }
    }

    // Try RSS if no posts yet (either no filters or JSON failed)
    if (posts.length === 0) {
      try {
        let rssUrl;
        if (requiredFlair) {
          const encodedFlair = encodeURIComponent(`flair:"${requiredFlair}"`);
          rssUrl = `https://www.reddit.com/r/${subreddit}/search.rss?q=${encodedFlair}&restrict_sr=1&sort=new&limit=${limit}`;
        } else {
          rssUrl = `https://www.reddit.com/r/${subreddit}.rss?limit=${limit}`;
        }

        const rssResponse = await axios.get(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000,
          validateStatus: (status) => status < 500
        });

        const allPosts = await parseRedditRSS(rssResponse.data);
        
        // Filter by author if specified (normalize /u/ prefix)
        let filteredPosts = allPosts;
        if (allowedAuthor) {
          const normalizeUsername = (username) => {
            if (!username) return '';
            return String(username).replace(/^\/u\//i, '').toLowerCase();
          };
          filteredPosts = allPosts.filter(post => 
            normalizeUsername(post.author) === normalizeUsername(allowedAuthor)
          );
        }
        
        posts = filteredPosts.slice(0, limit);
        apiMethod = 'RSS';
        
      } catch (rssError) {
        console.log('RSS also failed:', rssError.message);
        throw new Error(`Both JSON and RSS failed. RSS: ${rssError.message}`);
      }
    }

    // If still no posts after trying everything, return empty
    if (posts.length === 0) {
      console.log('No posts found after trying all methods');
    }

    if (debug) {
      // Debug details are logged server-side only, never returned to clients.
      console.log('Reddit fetch debug:', {
        request: { subreddit, requiredFlair, allowedAuthor, limit },
        apiMethod,
        postsFound: posts.length
      });
    }

    const payload = { posts };

    // Store in cache and set cache headers
    redditCache.set(cacheKey, { ts: Date.now(), payload });
    res.set('Cache-Control', `public, max-age=${Math.floor(BLOG_CACHE_TTL / 1000)}`);
    res.json(payload);
  } catch (error) {
    const status = error?.response?.status || 500;
    const data = error?.response?.data || { message: error.message };
    
    // Enhanced error logging for debugging
    console.error('Reddit API Error Details:', {
      status: status,
      url: error?.config?.url || 'unknown',
      responseType: typeof data,
      isHTML: typeof data === 'string' && data.includes('<html'),
      errorMessage: error.message,
      subreddit: process.env.REDDIT_SUBREDDIT,
      requiredFlair: process.env.REDDIT_REQUIRED_FLAIR
    });
    
    res.status(status >= 500 ? 502 : status).json({
      error: 'Failed to fetch posts from Reddit',
      posts: []
    });
  }
});

module.exports = router;


