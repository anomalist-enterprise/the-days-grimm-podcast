import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Laugh, Zap, MessageCircle, Heart, Brain, Shield } from 'lucide-react'
import aboutUsImage from '../../public/aboutUs.jpg'

const About: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  // Parallax effect for background
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])

  // Define the three pillars with icons
  const pillars = [
    {
      icon: Laugh,
      title: "Comical",
      description: "Official genre of 'COMEDY INTERVIEWS' with a history of hosting local stand-up comedians",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Thrilling", 
      description: "Interviews with extraordinary individuals - shooting survivors, rare medical conditions, combat veterans",
      color: "text-primary"
    },
    {
      icon: MessageCircle,
      title: "Controversial",
      description: "Unfiltered conversations on difficult topics like homelessness, AI, and religious hypotheticals", 
      color: "text-primary"
    }
  ]

  return (
    <section id="about" className="relative min-h-screen flex items-center py-20 overflow-hidden" ref={ref}>
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 will-change-transform"
        style={{ y: backgroundY }}
      >
        <div 
          className="absolute inset-0 bg-center bg-fixed about-background"
          style={{ backgroundImage: `url(${aboutUsImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
      </motion.div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl sm:text-6xl font-bold mb-8 gradient-text">
              About The Days Grimm
            </h2>
            <motion.div 
              className="bg-dark/60 backdrop-blur-sm rounded-2xl border border-primary/30 p-8 mb-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="text-primary w-6 h-6" />
                <Brain className="text-primary w-6 h-6" />
              </div>
              <p className="text-2xl italic text-white font-medium">
                "Brought to you by Sadness & ADHD (non-medicated)"
              </p>
            </motion.div>
          </motion.div>

          {/* Three Pillars */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                className="group"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
              >
                <div className="bg-dark/40 backdrop-blur-sm rounded-2xl border border-dark-border/50 p-8 h-full hover:bg-dark/60 hover:border-primary/30 transition-all duration-500 group-hover:-translate-y-2">
                  <div className="text-center">
                    <motion.div 
                      className="mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <pillar.icon className={`w-16 h-16 mx-auto ${pillar.color}`} />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Description */}
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="bg-dark/50 backdrop-blur-sm rounded-2xl border border-dark-border/50 p-8 lg:p-12">
              <div className="space-y-6 text-lg leading-relaxed">
                <motion.p 
                  className="text-text-secondary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  The Days Grimm is arguably Indiana's most comical, thrilling, and controversial podcast. This three-pronged mandate acts as a primary filter for our guest selection.
                </motion.p>
                
                <motion.p 
                  className="text-text-secondary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  Our brand is not built on polished narratives but on the authentic, often messy, intersection of hardship and humor. The most compelling guests are those who have navigated a "Grimm" reality and emerged with a story to tell, and ideally, a sense of humor about it.
                </motion.p>

                <motion.div
                  className="flex items-center justify-center gap-4 pt-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <Shield className="text-primary w-8 h-8" />
                  <p className="text-xl font-semibold text-white">
                    This dynamic is the core of our appeal and the primary filter for identifying a story worth telling.
                  </p>
                  <Shield className="text-primary w-8 h-8" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About 