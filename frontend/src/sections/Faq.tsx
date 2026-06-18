import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Plus, Minus } from 'lucide-react'

// Grounded in the show's real positioning, hosts, platforms, and location.
// Keep these in sync with the FAQPage JSON-LD in index.html.
const faqs = [
  {
    q: 'What is The Days Grimm Podcast?',
    a: 'The Days Grimm is a comedy interview podcast based in Indiana — arguably the state’s most comical, thrilling, and controversial. Hosts Brian Day and Thomas Grimm sit down with extraordinary guests for unfiltered conversations that swing from laugh-out-loud funny to genuinely thrilling.'
  },
  {
    q: 'Who are the hosts?',
    a: 'Thomas Grimm — creative director, photographer, and jeweler behind Anomalist Studios — and Brian Day, an Army infantry veteran and Quality/Lean manager with a degree from the University of Evansville.'
  },
  {
    q: 'Where can I listen to The Days Grimm?',
    a: 'New episodes are on YouTube, Spotify, and Apple Podcasts. Subscribe on any of them and each new episode shows up the moment it drops.'
  },
  {
    q: 'What kind of guests come on the show?',
    a: 'Local comedians, combat veterans, shooting survivors, people living with rare medical conditions, filmmakers, and anyone with a “Grimm” story worth telling. The common thread is a real story — and a sense of humor about it.'
  },
  {
    q: 'How often do new episodes come out?',
    a: 'New episodes drop regularly. The best way to never miss one is to subscribe on YouTube, Spotify, or Apple Podcasts.'
  },
  {
    q: 'Where is The Days Grimm based?',
    a: 'Indiana. The show leans into its Hoosier roots and frequently features guests from the local community.'
  },
  {
    q: 'How can I be a guest or get in touch?',
    a: 'Reach out through any of the show’s social channels — Instagram, Facebook, or X. The links are in the footer.'
  }
]

const Faq: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="section bg-dark-medium relative overflow-hidden" ref={ref}>
      <div className="container max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 gradient-text">FAQ</h2>
          <p className="text-xl text-text-secondary leading-relaxed">
            Everything you need to know about the show.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={f.q}
                className="border border-primary/20 rounded-2xl bg-dark/40 backdrop-blur-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-dark/40 transition-colors duration-300"
                >
                  <span className="text-base sm:text-lg font-semibold text-white">{f.q}</span>
                  <span className="text-primary shrink-0">
                    {isOpen ? <Minus size={22} /> : <Plus size={22} />}
                  </span>
                </button>
                {/* Always mounted (height-collapsed) so answer text stays in the DOM for crawlers */}
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <p className="px-5 sm:px-6 pb-6 text-text-secondary leading-relaxed">{f.a}</p>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Faq
