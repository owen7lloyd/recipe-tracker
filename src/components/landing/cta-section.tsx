'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="py-12 text-center"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/dashboard">
          <Button className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] px-8 py-3 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            Get Started
          </Button>
        </Link>
        <Link href="#features">
          <Button
            variant="outline"
            className="border-2 border-[#d4a574] px-8 py-3 text-[#2c2415] font-semibold rounded-full transition-all duration-300 hover:bg-[#d4a574] hover:text-white"
          >
            Learn More
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
