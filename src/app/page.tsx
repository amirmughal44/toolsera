import React from 'react';
import { Hero } from '@/components/home/Hero';
import { TrustSection } from '@/components/home/TrustSection';
import { PopularTools } from '@/components/home/PopularTools';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { CharityHighlight } from '@/components/home/CharityHighlight';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <TrustSection />
      <PopularTools />
      <CategoryGrid />
      <CharityHighlight />
    </div>
  );
}
