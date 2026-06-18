export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  episode_title?: string
  episode_url?: string
  published_at: string
}

export interface BlogResponse {
  posts: BlogPost[]
  error?: string
}

export const fetchBlogPosts = async (limit = 12): Promise<BlogResponse> => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  const response = await fetch(`${apiBase}/api/blog/posts?limit=${limit}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}
