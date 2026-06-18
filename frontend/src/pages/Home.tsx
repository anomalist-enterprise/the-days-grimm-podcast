import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// Components
import Navigation from '../components/Navigation'

// Sections
import Hero from '../sections/Hero'
import About from '../sections/About'
import Hosts from '../sections/Hosts'
import Episodes from '../sections/Episodes'
import Blog from '../sections/Blog'
import Faq from '../sections/Faq'
import Contact from '../sections/Contact'

const Home: React.FC = () => {
  const [, setIsMenuOpen] = useState<boolean>(false)
  const [, setScrolled] = useState<boolean>(false)
  const { scrollYProgress } = useScroll()
  // Map scroll progress (0 → 1) to width (0% → 100%) as a MotionValue string
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-dark text-text-primary">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-primary-light z-50"
        style={{ width: progressWidth }}
      />

      {/* Navigation */}
      <Navigation scrollToSection={scrollToSection} />

      {/* Hero Section */}
      <Hero scrollToSection={scrollToSection} />

      {/* About Section */}
      <About />

      {/* Hosts Section */}
      <Hosts />

      {/* Episodes Section */}
      <Episodes />

      {/* Blog Section */}
      <Blog />

      {/* FAQ Section */}
      <Faq />

      {/* Contact Section */}
      <Contact />
    </div>
  )
}

export default Home
