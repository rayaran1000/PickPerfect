"use client"

import { useState, useEffect, useRef } from "react"
import { Star } from "lucide-react"

interface Testimonial {
  id: number
  text: string
  author: string
  role: string
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
  className?: string
}

export function TestimonialsCarousel({ testimonials, className = "" }: TestimonialsCarouselProps) {
  const [isHovered, setIsHovered] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Continuous smooth scrolling animation
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        if (carouselRef.current) {
          const scrollWidth = carouselRef.current.scrollWidth
          const clientWidth = carouselRef.current.clientWidth
          const maxScroll = scrollWidth - clientWidth
          
          if (carouselRef.current.scrollLeft >= maxScroll) {
            // Reset to beginning when reaching the end
            carouselRef.current.scrollLeft = 0
          } else {
            // Smooth scroll forward
            carouselRef.current.scrollLeft += 3
          }
        }
      }, 30) // Update every 30ms for faster smooth animation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovered])

  return (
    <div 
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {testimonials.map((testimonial, index) => (
          <div 
            key={testimonial.id}
            className="group relative p-8 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg min-w-[400px] md:min-w-[500px] flex-shrink-0"
          >
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${
              index % 2 === 0 
                ? 'bg-gradient-to-r from-primary/5 to-purple-500/5' 
                : 'bg-gradient-to-r from-purple-500/5 to-pink-500/5'
            }`} />
            <div className="relative">
              <div className="flex items-center gap-1 mb-6 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="font-medium text-foreground">- {testimonial.author}, {testimonial.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 