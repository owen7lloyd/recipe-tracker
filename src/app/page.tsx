import { HeroSection } from '@/components/landing/hero-section';
import { FeatureCards } from '@/components/landing/feature-cards';
import { CTASection } from '@/components/landing/cta-section';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0]">
      <HeroSection />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <FeatureCards />
        <CTASection />
      </section>

      <footer className="border-t border-[#e8dcc8] py-8 text-center text-sm text-[#6b6250]">
        <p>Grow your cooking confidence with Recipe & Pantry Tracker</p>
      </footer>
    </main>
  );
}
