import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Mail, Check } from 'lucide-react'

type Status = 'idle' | 'loading' | 'ok' | 'err'

const Newsletter: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading' || status === 'ok') return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, hp, source: 'site' })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus('ok')
      } else {
        setStatus('err')
        setMessage(data.error || 'Something went wrong.')
      }
    } catch {
      setStatus('err')
      setMessage('Network error. Try again.')
    }
  }

  return (
    <section id="newsletter" className="section bg-dark relative overflow-hidden" ref={ref}>
      {/* on-brand glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="container relative z-10">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 mb-6">
            <Mail className="text-primary w-7 h-7" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Never Miss an Episode</h2>
          <p className="text-lg text-text-secondary mb-8 leading-relaxed">
            New episodes, guest drops, and a story every week — straight to your inbox. No spam, unsubscribe anytime.
          </p>

          {status === 'ok' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 bg-primary/15 border border-primary/40 rounded-xl px-6 py-4"
            >
              <Check className="text-primary w-5 h-5" />
              <span className="text-white font-medium">You&rsquo;re in. Welcome to The Days Grimm.</span>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              {/* honeypot: hidden from users, catches bots */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 px-5 py-4 rounded-xl bg-dark-light border border-dark-border text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-primary justify-center px-8 disabled:opacity-60"
              >
                {status === 'loading' ? 'Joining…' : 'Subscribe'}
              </button>
            </form>
          )}

          {status === 'err' && <p className="text-red-400 mt-4 text-sm">{message}</p>}
        </motion.div>
      </div>
    </section>
  )
}

export default Newsletter
