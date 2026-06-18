import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { fetchBlogPosts, type BlogPost } from '../services/blog'
import blogBackground from '../../public/blog-background.webp'

const Blog: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState<number>(4)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const data = await fetchBlogPosts(12)
        if (isMounted) {
          setPosts(data.posts || [])
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          setError('Failed to load posts')
          setLoading(false)
        }
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="blog" className="relative min-h-screen py-20 overflow-hidden" ref={ref}>
      {/* Parallax Background */}
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: backgroundY }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${blogBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      </motion.div>

      <div className="container relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 gradient-text">Our Blog</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Episode recaps, stories, and the darker corners of every conversation.
          </p>
        </motion.div>

        {loading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-3 bg-dark/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-dark-border">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-text-secondary">Loading latest posts...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block bg-red-500/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-red-500/30">
              <span className="text-red-400">{error}</span>
            </div>
          </motion.div>
        )}

        {posts.length > 0 ? (
          <>
            <div className="max-w-4xl mx-auto space-y-8">
              {posts.slice(0, visibleCount).map((post, index) => (
                <motion.a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group"
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                >
                  <div className="bg-dark/40 backdrop-blur-sm rounded-2xl border border-primary/20 p-8 hover:bg-dark/60 hover:border-primary/40 transition-all duration-500 group-hover:-translate-y-1">
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-text-secondary text-lg leading-relaxed mb-6">{post.excerpt}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <span className="text-sm text-text-muted">
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all duration-300">
                        Read post
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {posts.length > visibleCount && (
              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.button
                  className="bg-dark/60 backdrop-blur-sm text-white border-2 border-primary hover:bg-primary px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                  onClick={() => setVisibleCount((v) => v + 4)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Load More Posts
                </motion.button>
              </motion.div>
            )}
          </>
        ) : (
          !loading &&
          !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <div className="bg-dark/60 backdrop-blur-sm rounded-2xl border border-primary/20 p-12 max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold mb-6 gradient-text">Coming Soon</h3>
                <p className="text-xl text-text-secondary leading-relaxed">
                  Fresh posts are on the way — episode recaps and stories from behind the mic. Check back soon.
                </p>
              </div>
            </motion.div>
          )
        )}
      </div>
    </section>
  )
}

export default Blog
