# Design Implementation Instructions: Organic Garden Aesthetic

## Overview

This document provides comprehensive instructions for implementing the "Warm, Organic Garden" design concept across the Recipe & Pantry Tracker application. The design features a nature-inspired aesthetic with earthy tones, rounded forms, and a cozy, welcoming feel.

## Design System

### Color Palette

```
Primary Green:        #2d5016 (dark forest green)
Secondary Green:      #3d6b1f (medium forest green)
Accent Gold:          #d4a574 (warm tan/gold)
Light Background:     #faf8f3 (cream/off-white)
Card Background:      #ffffff (pure white)
Text Dark:            #2c2415 (dark brown)
Text Light:           #6b6250 (light brown)
Border Color:         #e8dcc8 (soft beige)
```

### Typography

**Display Font:** Merriweather (serif)
- Used for headings (h1, h2)
- Font weights: 400 (regular), 700 (bold)
- Install: `@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');`

**Body Font:** Poppins (sans-serif)
- Used for body text, buttons, UI elements
- Font weights: 300 (light), 500 (medium), 600 (semibold), 700 (bold)
- Install: `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;600;700&display=swap');`

### Spacing & Sizing

- **Base unit:** 0.5rem (8px)
- **Rounded corners:** 20px (cards), 50px (buttons)
- **Box shadows:** Soft shadows with rgba(45, 80, 22, 0.15) - organic feel
- **Transitions:** 0.3s ease for all interactive elements

## Implementation Steps

### 1. Update Global Styles

**File:** `/src/app/globals.css`

Replace the entire file with:

```css
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Poppins:wght@300;500;600;700&display=swap');

:root {
  --primary: #2d5016;
  --secondary: #6b8e23;
  --accent: #d4a574;
  --light-bg: #faf8f3;
  --card-bg: #ffffff;
  --text-dark: #2c2415;
  --text-light: #6b6250;
  --border: #e8dcc8;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #faf8f3 0%, #f0ebe0 100%);
  color: var(--text-dark);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Decorative background elements */
body::before {
  content: '';
  position: fixed;
  top: -10%;
  right: -5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(107, 142, 35, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}

body::after {
  content: '';
  position: fixed;
  bottom: -10%;
  left: -5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(212, 165, 116, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Merriweather', serif;
  font-weight: 700;
  letter-spacing: -0.5px;
}

h1 {
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  line-height: 1.2;
}

h2 {
  font-size: clamp(1.3rem, 4vw, 1.8rem);
  line-height: 1.3;
}

h3 {
  font-size: 1.2rem;
}

p {
  line-height: 1.6;
  font-weight: 300;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--secondary);
}

button {
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--light-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--accent);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--secondary);
}
```

### 2. Update Layout Component

**File:** `/src/app/layout.tsx`

Ensure the root layout includes proper structure:

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recipe & Pantry Tracker',
  description: 'Cultivate your kitchen, one recipe at a time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 3. Create Landing Page Component

**File:** `/src/components/landing/hero-section.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <header className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white py-16 px-6 text-center relative overflow-hidden shadow-lg">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-merriweather mb-2">
          🌱 Recipe & Pantry Tracker
        </h1>
        <p className="text-lg opacity-95 tracking-wide font-light">
          Cultivate your kitchen, one recipe at a time
        </p>
      </div>
    </header>
  );
}
```

### 4. Create Feature Cards Component

**File:** `/src/components/landing/feature-cards.tsx`

```typescript
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
      <Card className="p-8 border-2 border-[#e8dcc8] hover:border-[#d4a574] rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-2xl font-merriweather text-[#2d5016] mb-3">
          {title}
        </h2>
        <p className="text-[#6b6250] leading-relaxed text-sm font-light">
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
```

### 5. Create Call-to-Action Section

**File:** `/src/components/landing/cta-section.tsx`

```typescript
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
      className="text-center py-12"
    >
      <Link href="/dashboard">
        <Button className="px-8 py-3 bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white font-semibold rounded-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          Get Started
        </Button>
      </Link>
      <Link href="#features">
        <Button
          variant="outline"
          className="ml-4 px-8 py-3 border-2 border-[#d4a574] text-[#2c2415] font-semibold rounded-full hover:bg-[#d4a574] hover:text-white transition-all duration-300"
        >
          Learn More
        </Button>
      </Link>
    </motion.div>
  );
}
```

### 6. Update Main Landing Page

**File:** `/src/app/page.tsx`

```typescript
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureCards } from '@/components/landing/feature-cards';
import { CTASection } from '@/components/landing/cta-section';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0]">
      <HeroSection />

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <FeatureCards />
        <CTASection />
      </section>

      <footer className="text-center py-8 text-[#6b6250] text-sm border-t border-[#e8dcc8] mt-12">
        <p>Grow your cooking confidence with Recipe & Pantry Tracker</p>
      </footer>
    </main>
  );
}
```

### 7. Update Dashboard Header/Navigation

**File:** `/src/components/dashboard/header.tsx`

Replace with organic garden styled header:

```typescript
'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <header className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <h1 className="text-xl font-merriweather font-bold">
            Recipe & Pantry Tracker
          </h1>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard/recipes"
            className="hover:text-[#d4a574] transition-colors"
          >
            Recipes
          </Link>
          <Link
            href="/dashboard/pantry"
            className="hover:text-[#d4a574] transition-colors"
          >
            Pantry
          </Link>
          <Link
            href="/dashboard/grocery-lists"
            className="hover:text-[#d4a574] transition-colors"
          >
            Shopping
          </Link>

          <Button
            onClick={() => signOut()}
            className="bg-[#d4a574] text-[#2c2415] hover:bg-[#e5b885] rounded-full px-6"
          >
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  );
}
```

### 8. Update Card Components

**File:** `/src/components/ui/card.tsx`

Ensure card styling uses the organic aesthetic:

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border-2 border-[#e8dcc8] bg-white text-[#2c2415] shadow-sm transition-all hover:border-[#d4a574] hover:shadow-md',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

// Similar updates for CardHeader, CardTitle, CardContent, CardDescription
```

### 9. Update Button Styles

**File:** `/src/components/ui/button.tsx`

Update button variants to use organic colors:

```typescript
const variants = {
  default: 'bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white hover:shadow-lg hover:-translate-y-0.5',
  secondary: 'bg-[#d4a574] text-[#2c2415] hover:bg-[#e5b885]',
  outline: 'border-2 border-[#2d5016] text-[#2d5016] hover:bg-[#f0ebe0]',
  // ... other variants
}
```

### 10. Update Recipe Card Components

**File:** `/src/components/recipes/recipe-card.tsx`

```typescript
'use client';

import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings: number;
  category: string;
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  prepTime,
  cookTime,
  servings,
  category,
}: RecipeCardProps) {
  return (
    <Link href={`/dashboard/recipes/${id}`}>
      <Card className="overflow-hidden cursor-pointer rounded-3xl border-2 border-[#e8dcc8] hover:border-[#d4a574] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        {imageUrl && (
          <div className="relative w-full h-48 bg-[#f0ebe0]">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="mb-2">
            <Badge className="bg-[#6b8e23] text-white rounded-full">
              {category}
            </Badge>
          </div>

          <h3 className="text-lg font-merriweather text-[#2d5016] mb-3 font-bold">
            {title}
          </h3>

          <div className="flex gap-4 text-sm text-[#6b6250]">
            {prepTime && <span>⏱️ {prepTime}m prep</span>}
            {cookTime && <span>🍳 {cookTime}m cook</span>}
            <span>👥 {servings} servings</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
```

### 11. Update Form Styles

All form inputs should use the organic aesthetic. Update input components:

**File:** `/src/components/ui/input.tsx`

```typescript
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border-2 border-[#e8dcc8] bg-white px-3 py-2 text-sm text-[#2c2415] placeholder:text-[#b0a695] transition-colors focus:border-[#d4a574] focus:outline-none focus:ring-2 focus:ring-[#d4a574]/20',
        className
      )}
      {...props}
    />
  )
)
```

### 12. Mobile Responsiveness

Ensure all components handle mobile gracefully:

```typescript
// Mobile-first approach in Tailwind
<div className="
  grid 
  grid-cols-1                    // Mobile: 1 column
  md:grid-cols-2                 // Tablet: 2 columns
  lg:grid-cols-3                 // Desktop: 3 columns
  gap-4
  md:gap-6
  lg:gap-8
">
```

### 13. Add Animations Library

**Install Framer Motion:**

```bash
pnpm add framer-motion
```

Use in components for smooth, delightful animations:

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### 14. Update Utility Functions

**File:** `/src/lib/utils.ts`

Ensure `cn()` function is available for class merging:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Color Implementation Checklist

- [ ] Update CSS custom properties in globals.css
- [ ] Import Google Fonts (Merriweather + Poppins)
- [ ] Update all button styles with green gradients
- [ ] Update card borders to beige (#e8dcc8)
- [ ] Update hover states to use accent gold (#d4a574)
- [ ] Update text colors (dark: #2c2415, light: #6b6250)
- [ ] Add background gradient to body
- [ ] Update links to use primary green with hover effect
- [ ] Update form inputs with rounded borders
- [ ] Update badges with secondary green

## Typography Implementation Checklist

- [ ] h1/h2 use Merriweather (serif) with 700 weight
- [ ] Body text uses Poppins (sans-serif) with 300-400 weight
- [ ] Letter spacing: -0.5px for headings, 0-0.5px for body
- [ ] Line heights: 1.2 for h1, 1.3 for h2, 1.6 for p
- [ ] Font sizes use clamp() for responsive scaling
- [ ] Font weights: 300 (light), 500 (medium), 600 (semibold), 700 (bold)

## Component-by-Component Updates

### Recipes Page
- Update recipe list with organic card styling
- Add rounded corners (20px) to all elements
- Use earth tone shadows on hover
- Add animation on card load

### Pantry Page
- Update pantry item display with organic cards
- Use beige borders and green accents
- Smooth transitions on add/edit/delete
- Responsive grid layout

### Grocery Lists Page
- Update list cards with rounded corners
- Use accent gold for checkmarks
- Organic shadows on interactions
- Mobile-friendly category organization

### Dashboard
- Update main navigation with green gradient header
- Add subtle background decorative elements
- Use organic spacing (multiples of 0.5rem)
- Smooth transitions between pages

## Performance Considerations

1. **Lazy load images** on recipe cards
2. **Use CSS-only animations** where possible (avoid JS animations)
3. **Optimize background gradients** (no complex patterns that hurt performance)
4. **Minimize shadow effects** on large lists
5. **Use CSS variables** for consistent theming

## Testing the Design

After implementation:

1. **Visual Testing**
   - Check colors match design system
   - Verify spacing and alignment
   - Test hover states and transitions
   - Check mobile responsiveness

2. **Cross-browser Testing**
   - Chrome/Edge
   - Firefox
   - Safari
   - Mobile browsers

3. **Accessibility Testing**
   - Color contrast ratios (WCAG AA)
   - Keyboard navigation
   - Screen reader compatibility
   - Focus indicators

## Rollback Instructions

If you need to revert to the original design:

1. `git revert <commit-hash>` to revert the design commits
2. Remove Framer Motion if added
3. Restore original color values in globals.css
4. Restore original typography settings

## Additional Resources

- **Google Fonts:** https://fonts.google.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion/
- **shadcn/ui:** https://ui.shadcn.com/

## Notes for Implementation Agent

- The design uses CSS custom properties (CSS variables) for easy theme management
- All interactive elements should have smooth 0.3s transitions
- Rounded corners should be 20px for cards, 50px for buttons
- Colors are already defined in the design system above
- Mobile-first approach: design for mobile first, then add tablet/desktop breakpoints
- Use Tailwind's responsive prefixes (sm:, md:, lg:, xl:)
- Ensure all text meets WCAG color contrast requirements
- Test the design on actual devices, not just in browser DevTools

---

**Design by:** Claude
**Implementation Date:** [To be filled in by developer]
**Status:** [Ready for Implementation]
