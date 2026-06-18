import React from 'react'
import { User, Camera } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

export interface Host {
  name: string
  title: string
  icon: React.ComponentType<LucideProps>
  description: string
  bio: string
  traits: string[]
}

export const hosts: Host[] = [
  {
    name: 'Thomas',
    title: 'Creative Director & Jewelry Artist',
    icon: Camera,
    description: 'Thomas is the creative force behind The Anomalist Company and Anomalist Studios, where he dives into photography, video production, and storytelling. By day, he\'s also a skilled jeweler.',
    bio: 'Thomas brings a laid-back, introspective energy to the show—always curious, always evolving. A student of self-development, he\'s recently jumped into the world of fitness with the goal of completing a triathlon next year. He\'s all about digging deep, learning lessons, and pushing limits.',
    traits: ['Creative Director', 'Jewelry Artist', 'Introspective']
  },
  {
    name: 'Brian',
    title: 'Army Infantry Veteran & Quality/Lean Manager',
    icon: User,
    description: 'Brian is an Army Infantry veteran who served a tour in Afghanistan, bringing a no-nonsense attitude and disciplined mindset to the mic. With a degree in Exercise and Sport Science from the University of Evansville, he lives and breathes physical activity.',
    bio: 'Loud, lovable, and never afraid to speak his mind, Brian also works as a Quality/Lean Manager—constantly focused on growth, precision, and improvement. Whether it\'s fitness, failure, or the fire that drives someone forward, Brian\'s energy fuels every episode.',
    traits: ['Army Veteran', 'Fitness Expert', 'No-Nonsense']
  }
]
