import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { hosts } from '../data/content'
import { Zap, Users, Mic } from 'lucide-react'

const Hosts: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px" })

  return (
    <section id="hosts" className="section bg-dark-medium relative overflow-hidden" ref={ref}>
      {/* Artistic Background Elements */} 
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-20 bg-gradient-to-b from-primary/30 to-transparent transform rotate-12"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-16 bg-gradient-to-b from-primary/20 to-transparent transform -rotate-45"></div>
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 gradient-text">
            Meet Your Hosts
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary"></div>
            <Mic className="text-primary w-8 h-8" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary"></div>
          </div>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            The dynamic duo behind The Days Grimm - bringing you comedy, controversy, and compelling conversations.
          </p>
        </motion.div>

        {/* Alternating Host Layout */}
        <div className="max-w-7xl mx-auto space-y-24">
          {hosts.map((host, index) => {
            const isLeft = index % 2 === 0;
            
            return (
              <motion.div
                key={host.name}
                className="relative"
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isLeft ? -100 : 100 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.3 }}
              >
                {/* Chaotic Separator Line */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
                  <div className={`w-px h-32 bg-gradient-to-b from-primary/40 via-primary/60 to-primary/40 transform ${isLeft ? 'rotate-12' : '-rotate-12'}`}></div>
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full animate-pulse`}></div>
                </div>

                <div className={`grid lg:grid-cols-2 gap-12 items-center ${!isLeft ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Image Side */}
                  <motion.div 
                    className={`${!isLeft ? 'lg:col-start-2' : ''} flex justify-center`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative group flex items-center justify-center">
                      {/* On-brand red glow behind the cutout */}
                      <div className="absolute w-60 h-60 sm:w-72 sm:h-72 bg-primary/25 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-500 pointer-events-none"></div>

                      {isInView && (
                        <picture>
                          <source
                            srcSet={host.name === 'Brian' ? '/Brian_Day.webp' : '/Thomas_Grimm.webp'}
                            type="image/webp"
                          />
                          <img
                            src={host.name === 'Brian' ? '/Brian_Day.png' : '/Thomas_Grimm.png'}
                            alt={`${host.name}, co-host of The Days Grimm Podcast`}
                            className="relative w-72 h-72 sm:w-80 sm:h-80 object-contain drop-shadow-2xl"
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                          />
                        </picture>
                      )}
                    </div>
                  </motion.div>

                  {/* Content Side */}
                  <motion.div 
                    className={`${!isLeft ? 'lg:col-start-1' : ''} ${isLeft ? 'lg:text-left' : 'lg:text-right'} text-center space-y-6`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.3 }}
                  >
                    <div>
                      <h3 className="text-4xl font-bold mb-2 gradient-text">{host.name}</h3>
                      <p className="text-primary font-semibold text-lg uppercase tracking-wider mb-6">{host.title}</p>
                    </div>
                    
                    <div className="bg-dark/40 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-lg shadow-white/5">
                      <p className="text-text-secondary mb-4 leading-relaxed text-lg">{host.description}</p>
                      <p className="text-text-secondary leading-relaxed">{host.bio}</p>
                    </div>

                    <div className={`flex flex-wrap gap-3 ${isLeft ? 'lg:justify-start' : 'lg:justify-end'} justify-center`}>
                      {host.traits.map((trait, traitIndex) => (
                        <motion.span 
                          key={trait} 
                          className="px-4 py-2 bg-primary/20 text-primary text-sm font-medium rounded-full border border-primary/30 hover:bg-primary/30 transition-colors duration-300"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.3 + traitIndex * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          {trait}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Separator */}
        <motion.div 
          className="flex items-center justify-center my-20"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary"></div>
            <div className="relative">
              <Users className="text-primary w-12 h-12" />
              <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
            </div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary"></div>
          </div>
        </motion.div>

        {/* Together Section - Reimagined */}
        <motion.div 
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Artistic Background */}
          <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-3xl transform rotate-1"></div>
          <div className="absolute -inset-4 bg-gradient-to-tl from-primary/15 via-transparent to-primary/10 rounded-2xl transform -rotate-1"></div>
          
          <div className="relative bg-dark/60 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center shadow-xl shadow-white/10 hover:shadow-white/20 transition-all duration-500">
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <Zap className="text-primary w-8 h-8" />
              <h3 className="text-3xl font-bold gradient-text">Together</h3>
              <Zap className="text-primary w-8 h-8" />
            </motion.div>
            
            <motion.p 
              className="text-text-secondary leading-relaxed text-xl"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              Brian and Thomas are passionate about "the come-up story"—how people start, how they fight through adversity, and what keeps them going. Their interviews highlight the raw, the real, and the inspiring—always ending with takeaways that listeners can apply to their own grind.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hosts 