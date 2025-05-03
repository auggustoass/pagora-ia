
import React from 'react';
import { NavBar } from '@/components/landing/NavBar';
import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { BenefitsList } from '@/components/landing/BenefitsList';
import { TestimonialSection } from '@/components/landing/TestimonialSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { DemoSection } from '@/components/landing/DemoSection';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FloatingWhatsAppButton } from '@/components/landing/FloatingWhatsAppButton';

const Landing = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <ProblemSection />
        <BenefitsList />
        <TestimonialSection />
        <PricingSection />
        <DemoSection />
        <SecuritySection />
      </main>
      <LandingFooter />
      <FloatingWhatsAppButton />
    </div>
  );
};

export default Landing;
