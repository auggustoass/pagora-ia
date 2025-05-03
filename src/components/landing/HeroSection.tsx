
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Coins, Cpu } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full filter blur-[120px]" />
      </div>
      
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
            Automatize suas Cobranças via Pix com WhatsApp e Inteligência Artificial
          </h1>
          
          <p className="text-xl text-muted-foreground animate-fade-in" style={{animationDelay: "0.2s"}}>
            Reduza a inadimplência e economize tempo com o assistente de cobrança mais inteligente do Brasil.
          </p>
          
          <div className="flex animate-fade-in" style={{animationDelay: "0.4s"}}>
            <Button asChild size="lg" className="bg-[#aaff00] hover:bg-[#88cc00] text-black font-medium shadow-lg hover:shadow-xl transition-all">
              <Link to="/auth">
                Quero Cobrar com Pix e WhatsApp
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-4 pt-6 animate-fade-in" style={{animationDelay: "0.6s"}}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
              <span>Sem contrato</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
              <span>100% seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
              <span>Suporte 24h</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="glass-card p-4 rounded-xl shadow-2xl relative z-10 hover-float pulse-glow">
            <img 
              src="/images/dashboard-preview.png" 
              alt="HBlackPix Dashboard" 
              className="rounded-lg w-full"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/800x600/10b981/FFFFFF?text=HBlackPix+Dashboard';
              }}
            />
          </div>
          
          <div className="absolute top-12 -left-8 flex animate-pulse z-20">
            <div className="rounded-full bg-primary p-3">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="absolute bottom-12 left-16 flex animate-pulse z-20" style={{animationDelay: "0.3s"}}>
            <div className="rounded-full bg-yellow-500 p-3">
              <Coins className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="absolute top-1/2 -right-4 flex animate-pulse z-20" style={{animationDelay: "0.6s"}}>
            <div className="rounded-full bg-purple-600 p-3">
              <Cpu className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
