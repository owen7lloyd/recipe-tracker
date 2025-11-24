'use client';

import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="rounded-3xl border-2 border-[#e8dcc8] bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#d4a574] hover:shadow-xl">
        <div className="mb-4 text-4xl">{icon}</div>
        <h2 className="mb-3 text-2xl font-merriweather font-bold text-[#2d5016]">
          {title}
        </h2>
        <p className="text-sm font-light leading-relaxed text-[#6b6250]">
          {description}
        </p>
      </Card>
    </motion.div>
  );
}

export function FeatureCards() {
  const features = [
    {
      icon: '📥',
      title: 'Harvest Recipes',
      description:
        'Import from websites or add manually. Keep all your favorite recipes in one place, organized and ready to cook.',
    },
    {
      icon: '🥬',
      title: 'Track Your Garden',
      description:
        'Know what you have in your pantry. See which recipes you can make with your available ingredients right now.',
    },
    {
      icon: '🛒',
      title: 'Smart Shopping',
      description:
        'Generate organized grocery lists from your recipes automatically. Shop with intention, never forget an ingredient.',
    },
  ];

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          {...feature}
          delay={0.1 + index * 0.1}
        />
      ))}
    </div>
  );
}
