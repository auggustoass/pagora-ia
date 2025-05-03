
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DemoSection = () => {
  return (
    <section id="demo-section" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-6">Veja a plataforma em ação</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Assista ao vídeo de demonstração ou crie uma fatura teste agora mesmo.
          </p>
          
          <div className="glass-card p-8 mb-12 hover-float transition-all">
            <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center overflow-hidden relative cursor-pointer group">
              <img 
                src="/images/demo-thumbnail.jpg"
                alt="Video demonstração"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/1280x720/1a1a1a/88cc00?text=Assista+à+Demonstração';
                }}
              />
              
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all"></div>
              
              <div className="w-16 h-16 rounded-full bg-[#aaff00] flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-black fill-black ml-1" />
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">
              🎥 Veja como automatizar suas cobranças em menos de 1 minuto
            </p>
          </div>
          
          <Button asChild size="lg" className="bg-[#aaff00] hover:bg-[#88cc00] text-black font-medium">
            <Link to="/auth?tab=signup" className="flex items-center">
              Quero automatizar minhas cobranças agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
