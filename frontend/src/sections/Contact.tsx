import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Youtube, Music, Smartphone, Instagram, Facebook } from 'lucide-react'

// Custom X (Twitter) Icon Component
const XIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const Contact: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  // Organized into categories
  const listenLinks = [
    { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/c/TheDaysGrimm' },
    { icon: Music, label: 'Spotify', href: 'https://open.spotify.com/show/3JLH1IVdjohOrAOoXTsk18' },
    { icon: Smartphone, label: 'Apple Podcasts', href: 'https://podcasts.apple.com/us/podcast/the-days-grimm-podcast/id1545803797' }
  ]

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/thedaysgrimmpodcast/' },
    { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/thedaysgrimm/' },
    { icon: XIcon, label: 'X', href: 'https://twitter.com/thedaysgrimm' }
  ]

  return (
    <footer id="contact" className="bg-dark border-t border-dark-border py-12" ref={ref}>
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 mb-8 text-center md:text-left max-w-5xl mx-auto">
          {/* Brand Section */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-4 gradient-text">The Days Grimm</h3>
            <p className="text-text-secondary leading-relaxed">
              Exploring the darker side of life, one episode at a time.
            </p>
          </motion.div>

          {/* Watch & Listen Section */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4 gradient-text">Listen On</h4>
            <ul className="space-y-2 flex flex-col items-center md:items-start">
              {listenLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-primary transition-colors duration-300 flex items-center gap-2 justify-center md:justify-start"
                  >
                    <link.icon size={18} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Media Section */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold mb-4 gradient-text">Follow Us</h4>
            <ul className="space-y-2 flex flex-col items-center md:items-start">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-primary transition-colors duration-300 flex items-center gap-2 justify-center md:justify-start"
                  >
                    <link.icon size={18} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Footer Copyright */}
        <motion.div
          className="text-center pt-8 border-t border-dark-border text-text-muted"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p>&copy; 2026 The Days Grimm LLC. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Contact 