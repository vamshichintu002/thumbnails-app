import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

const faqs = [
  {
    question: "How does ThumbAI generate thumbnails?",
    answer: "ThumbAI uses advanced AI algorithms to analyze your video title, content, and style preferences to generate eye-catching thumbnails. Our system understands context and creates visually appealing designs that match your content's theme."
  },
  {
    question: "Can I customize the generated thumbnails?",
    answer: "Yes! After AI generation, you can fully customize your thumbnails using our editor. Adjust colors, text, layouts, and add your own elements to make them perfectly match your brand."
  },
  {
    question: "What image formats and sizes are supported?",
    answer: "We support all major social media platforms with their recommended sizes: YouTube (1280x720), Instagram (1080x1080, 1080x1350), TikTok (1080x1920), and more. Images are exported in high-quality PNG or JPG formats."
  },
  {
    question: "How many thumbnails can I generate?",
    answer: "The number of thumbnails depends on your plan. Free trial users get 5 thumbnails, Starter plan includes 100 per month, while Creator and Agency plans offer unlimited generations."
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes, we offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our service, simply contact our support team for a full refund."
  },
  {
    question: "Do you offer team collaboration features?",
    answer: "Yes! Our Agency plan includes team collaboration features, allowing multiple team members to work together, share assets, and maintain brand consistency across all thumbnails."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-24 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about ThumbAI
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "rounded-xl border border-white/10",
                "bg-muted/50 backdrop-blur-sm overflow-hidden",
                openIndex === index ? "bg-gradient-to-b from-blue-500/5 to-transparent" : ""
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full p-6 text-left"
              >
                <span className="text-lg font-medium">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "ml-4 flex-shrink-0",
                    openIndex === index ? "text-blue-400" : "text-muted-foreground"
                  )}
                >
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center p-8 rounded-xl border border-white/10 bg-muted/50 backdrop-blur-sm"
        >
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-blue-500/10 text-blue-400 mb-4">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help you 24/7
          </p>
          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Contact Support
          </button>
        </motion.div>
      </div>
    </section>
  );
}