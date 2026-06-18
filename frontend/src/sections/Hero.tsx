import { motion } from 'framer-motion'
import { Play, Youtube, Music, Headphones } from 'lucide-react'

interface HeroProps {
  scrollToSection: (sectionId: string) => void
}

// "Full Length Episodes" playlist — always resolves to the newest full episode
// (excludes Shorts/clips). No backend/API key needed.
const YOUTUBE_LATEST =
  'https://www.youtube-nocookie.com/embed/videoseries?list=PLEU_P6cu46UblHKQr3cADL3nIxWNoUddq&rel=0'

const SPOTIFY = 'https://open.spotify.com/show/3JLH1IVdjohOrAOoXTsk18'
const APPLE = 'https://podcasts.apple.com/us/podcast/the-days-grimm-podcast/id1545803797'
const YOUTUBE = 'https://www.youtube.com/c/TheDaysGrimm'

const Hero: React.FC<HeroProps> = ({ scrollToSection }) => {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center bg-dark pt-24 pb-16 overflow-hidden"
    >
      {/* Background video — poster paints instantly for fast LCP, video streams in after */}
      <video
        className="absolute inset-0 w-full h-full object-cover hidden sm:block"
        src="/hero.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      <video
        className="absolute inset-0 w-full h-full object-cover sm:hidden pointer-events-none"
        src="/hero-mobile.mp4"
        poster="/hero-poster-mobile.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />

      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/55 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — identity + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <span className="inline-block text-primary font-semibold tracking-[0.15em] sm:tracking-[0.25em] uppercase text-[10px] sm:text-sm mb-4">
              Indiana&rsquo;s Comedy Interview Podcast
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl mb-5 text-white">
              The Days <span className="block text-primary">Grimm</span>
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary mb-4 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Comical, thrilling, and controversial &mdash; comedy interviews with extraordinary
              guests and the unfiltered conversations no one else will have.
            </p>
            <p className="text-text-muted text-xs sm:text-sm uppercase tracking-[0.2em] mb-8">
              Comical &middot; Thrilling &middot; Controversial
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <button
                onClick={() => scrollToSection('episodes')}
                className="btn btn-primary w-full sm:w-auto justify-center"
              >
                <Play size={20} />
                Browse Episodes
              </button>
              <a
                href={`${YOUTUBE}?sub_confirmation=1`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline w-full sm:w-auto justify-center"
              >
                <Youtube size={20} />
                Subscribe
              </a>
            </div>

            {/* Listen-on row */}
            <div className="flex items-center gap-4 justify-center lg:justify-start mt-8">
              <span className="text-text-muted text-sm">Listen on</span>
              <a
                href={SPOTIFY}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Listen on Spotify"
                className="w-10 h-10 rounded-full bg-dark-light border border-dark-border flex items-center justify-center text-text-secondary hover:text-white hover:border-primary hover:bg-primary/20 transition-all duration-300"
              >
                <Music size={18} />
              </a>
              <a
                href={APPLE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Listen on Apple Podcasts"
                className="w-10 h-10 rounded-full bg-dark-light border border-dark-border flex items-center justify-center text-text-secondary hover:text-white hover:border-primary hover:bg-primary/20 transition-all duration-300"
              >
                <Headphones size={18} />
              </a>
              <a
                href={YOUTUBE}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Watch on YouTube"
                className="w-10 h-10 rounded-full bg-dark-light border border-dark-border flex items-center justify-center text-text-secondary hover:text-white hover:border-primary hover:bg-primary/20 transition-all duration-300"
              >
                <Youtube size={18} />
              </a>
            </div>
          </motion.div>

          {/* Right — always-latest episode embed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-3 bg-primary/25 blur-3xl rounded-3xl pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-2xl shadow-black/60 bg-black">
              <div className="px-4 py-2.5 flex items-center gap-2 border-b border-white/10 bg-dark/80">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs uppercase tracking-[0.2em] text-text-secondary font-semibold">
                  Latest Episode
                </span>
              </div>
              <div className="relative w-full aspect-video">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={YOUTUBE_LATEST}
                  title="Latest episode — The Days Grimm Podcast"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
