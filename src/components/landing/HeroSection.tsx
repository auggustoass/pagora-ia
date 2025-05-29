
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Smartphone, ArrowDown } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export const HeroSection = () => {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full filter blur-[120px]" />
      </div>
      
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
            Chega de cobrar cliente na mão.
            <span className="text-gradient"> Automatize suas cobranças via WhatsApp + Pix, sem taxas e com IA.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground animate-fade-in" style={{animationDelay: "0.2s"}}>
            Ideal para agências, freelancers e gestores que cansaram de correr atrás de cliente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{animationDelay: "0.4s"}}>
            <Button asChild size="lg" className="bg-[#aaff00] hover:bg-[#88cc00] text-black font-medium shadow-lg hover:shadow-xl transition-all">
              <Link to="/auth?tab=signup">
                Criar conta gratuita
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary hover:bg-primary/10" 
              onClick={scrollToDemo}
            >
              Ver como funciona
              <ArrowDown className="ml-2 h-4 w-4" />
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
          <div className="glass-card p-4 rounded-xl shadow-2xl relative z-10 hover-float">
            <AspectRatio ratio={9/16} className="relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="w-[280px] h-[560px] rounded-[36px] border-8 border-gray-800 overflow-hidden shadow-2xl">
                  <img 
                    src="/images/whatsapp-pix-mockup.png" 
                    alt="WhatsApp e Pix" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/280x560/1a1a1a/88cc00?text=WhatsApp+%2B+Pix';
                    }}
                  />
                </div>
                
                <div className="absolute -right-8 top-1/3 glass-card p-2 rounded-lg shadow-lg animate-pulse">
                  <img 
                    src="/images/dashboard-snippet.png" 
                    alt="Dashboard" 
                    className="w-32 h-24 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/128x96/1a1a1a/88cc00?text=Dashboard';
                    }}
                  />
                </div>
              </div>
            </AspectRatio>
          </div>
          
          <div className="absolute top-12 -left-8 flex animate-pulse z-20">
            <div className="rounded-full bg-primary p-3">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="absolute bottom-12 left-16 flex animate-pulse z-20" style={{animationDelay: "0.3s"}}>
            <div className="rounded-full bg-yellow-500 p-3">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
