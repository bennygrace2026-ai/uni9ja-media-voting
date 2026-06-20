import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/faqs').then(res => res.json()).then(data => setFaqs(data)).catch(console.error);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO 
        title="FAQ - Help & Support"
        description="Frequently Asked Questions about UNI9JA MEDIA. Find answers regarding registration, eligibility, votes approval, costs, and terms."
      />
      <h1 className="text-4xl font-extrabold text-neutral-900 mb-8 border-b border-neutral-200 pb-4">
        Frequently Asked Questions
      </h1>
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <p className="text-neutral-500">No FAQs available at the moment.</p>
        ) : (
          faqs.map((faq, idx) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)} 
                className="w-full px-6 py-4 flex items-center justify-between font-bold text-left focus:outline-none"
              >
                <span>{faq.question}</span>
                <motion.div animate={{ rotate: openIndex === idx ? 180 : 0 }} className="text-neutral-400">
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: "auto" }} 
                    exit={{ height: 0 }} 
                    className="overflow-hidden bg-neutral-50 border-t border-neutral-100"
                  >
                    <div className="px-6 py-4 text-neutral-600 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
