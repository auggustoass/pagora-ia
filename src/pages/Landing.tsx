
import React from 'react';
import { NavBar } from '@/components/landing/NavBar';
import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { ChargeTypesSection } from '@/components/landing/ChargeTypesSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialSection } from '@/components/landing/TestimonialSection';
import { TechnologySection } from '@/components/landing/TechnologySection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { FAQSection } from '@/components/landing/FAQSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FloatingWhatsAppButton } from '@/components/landing/FloatingWhatsAppButton';

const Landing = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <ChargeTypesSection />
        <ComparisonSection />
        <PricingSection />
        <TestimonialSection />
        <TechnologySection />
        <DemoSection />
        <SecuritySection />
        <FAQSection />
      </main>
      <LandingFooter />
      <FloatingWhatsAppButton />
    </div>
  );
};

export default Landing;
