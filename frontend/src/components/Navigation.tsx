import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Youtube } from 'lucide-react'

const SUBSCRIBE_URL = 'https://www.youtube.com/c/TheDaysGrimm?sub_confirmation=1'

interface NavigationProps {
  scrollToSection: (sectionId: string) => void
}

const Navigation: React.FC<NavigationProps> = ({ scrollToSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [scrolled, setScrolled] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = ['home', 'about', 'hosts', 'episodes', 'blog', 'faq']

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${
      scrolled ? 'bg-dark/98 backdrop-blur-md' : 'bg-dark/95 backdrop-blur-sm'
    } border-b border-dark-border`}>
      <div className="container py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">
            The Days Grimm
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {navItems.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="text-text-primary hover:text-primary transition-colors duration-300 font-medium capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
            <a
              href={SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary py-2 px-5 text-sm"
            >
              <Youtube size={16} />
              Subscribe
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-text-primary hover:text-primary transition-colors duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 pb-4"
          >
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item}>
                  <button
                    onClick={() => { scrollToSection(item); setIsMenuOpen(false); }}
                    className="text-text-primary hover:text-primary transition-colors duration-300 font-medium capitalize block w-full text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href={SUBSCRIBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full justify-center mt-2"
                >
                  <Youtube size={16} />
                  Subscribe
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navigation 