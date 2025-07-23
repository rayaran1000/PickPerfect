"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQItem[]
  className?: string
}

export function FAQAccordion({ faqs, className = "" }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-border/50 last:border-b-0">
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full flex items-center justify-between py-6 px-0 text-left hover:bg-muted/50 transition-colors rounded-lg"
          >
            <span className="text-lg font-medium text-foreground pr-4">
              {faq.question}
            </span>
            <div className="flex-shrink-0">
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>
          
          {openIndex === index && (
            <div className="pb-6 px-0">
              <p className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 