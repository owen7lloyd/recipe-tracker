'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] px-6 py-16 text-center shadow-lg">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 size-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10">
        <h1 className="mb-2 text-4xl font-merriweather md:text-5xl">
          🌱 Recipe & Pantry Tracker
        </h1>
        <p className="font-light tracking-wide opacity-95">
          Cultivate your kitchen, one recipe at a time
        </p>
      </div>
    </header>
  );
}
