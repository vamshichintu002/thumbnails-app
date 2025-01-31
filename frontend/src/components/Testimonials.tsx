import { cn } from "../lib/utils"
import { TestimonialCard } from "./ui/testimonial-card"

const testimonials1 = [
  {
    author: {
      name: "Alex Chen",
      handle: "@alexcreates",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "Thumbnails Labs has completely transformed my YouTube workflow. I used to spend hours creating thumbnails, now it takes seconds!",
    href: "#"
  },
  {
    author: {
      name: "Sarah Johnson",
      handle: "@sarahcontent",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "The AI understands exactly what my video is about and creates perfect thumbnails every time. My CTR has increased by 40%!",
    href: "#"
  },
  {
    author: {
      name: "Marcus Rodriguez",
      handle: "@marcustech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    text: "As a tech reviewer, having consistent, professional thumbnails is crucial. Thumbnails Labs delivers exactly what I need.",
  },
  {
    author: {
      name: "Emily Zhang",
      handle: "@emilystreams",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "The multi-platform support is amazing. One click and I have perfect thumbnails for YouTube, Instagram, and TikTok!",
  }
]

const testimonials2 = [
  {
    author: {
      name: "Michael Brown",
      handle: "@michaelmusic",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face"
    },
    text: "The music visualizer thumbnails are incredible! My audience engagement has never been better.",
    href: "#"
  },
  {
    author: {
      name: "Rachel Lee",
      handle: "@rachelarts",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    text: "As an art channel, the AI perfectly captures the essence of my tutorials. Simply amazing!",
    href: "#"
  },
  {
    author: {
      name: "Tom Anderson",
      handle: "@tomtech",
      avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face"
    },
    text: "The tech review thumbnails are spot on. Clean, professional, and eye-catching every time.",
  },
  {
    author: {
      name: "Sofia Garcia",
      handle: "@sofiatravel",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    text: "Perfect for my travel vlogs! The AI captures the essence of each destination beautifully.",
  }
]

function TestimonialRow({ testimonials }: { testimonials: typeof testimonials1 }) {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
        <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, setIndex) => (
            testimonials.map((testimonial, i) => (
              <TestimonialCard 
                key={`${setIndex}-${i}`}
                {...testimonial}
              />
            ))
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
    </div>
  )
}

function CenterExpandingTestimonials({ testimonials }: { testimonials: typeof testimonials1 }) {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
        <div className="flex shrink-0 justify-center [gap:var(--gap)] animate-expand-from-center flex-row group-hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, setIndex) => (
            testimonials.map((testimonial, i) => (
              <TestimonialCard 
                key={`${setIndex}-${i}`}
                {...testimonial}
              />
            ))
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
    </div>
  )
}

export function Testimonials() {
  return (
    <section id="reviews" className="bg-background text-foreground py-24 relative">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center sm:gap-16 px-4">
        <div className="flex flex-col items-center gap-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-bold leading-tight sm:text-5xl sm:leading-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Don't Just Take Our Word for It—See What Our Users Have to Say!
          </h2>
          <p className="text-md max-w-[600px] text-muted-foreground sm:text-xl">
            Join thousands of content creators who are already using Thumbnails Labs to create stunning thumbnails
          </p>
        </div>

        <div className="flex flex-col gap-16 w-full">
          <TestimonialRow testimonials={testimonials1} />
          <CenterExpandingTestimonials testimonials={testimonials2} />
        </div>
      </div>
    </section>
  )
}