
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto p-6 md:p-10">
        <div className="flex flex-col items-center justify-center space-y-8 mb-8">
          <h2 className="text-2xl font-bold text-gradient text-glow">HBLACKPIX</h2>
          
          <Button asChild variant="outline" className="border-[#aaff00] text-primary hover:bg-[#aaff00]/10">
            <a href="https://api.whatsapp.com/send?phone=5511998115159" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Fale com um especialista via WhatsApp
            </a>
          </Button>
          
          <Button asChild size="lg" className="bg-[#aaff00] hover:bg-[#88cc00] text-black font-medium">
            <Link to="/auth?tab=signup">
              Quero automatizar minhas cobranças
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Coluna 1: Links rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/planos" className="text-muted-foreground hover:text-primary transition-colors">Planos</Link></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Login</Link></li>
            </ul>
          </div>
          
          {/* Coluna 2: Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Termos de Serviço</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Política de Cookies</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">LGPD</a></li>
            </ul>
          </div>
          
          {/* Coluna 3: Contato */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>suporte@hblackpix.com</li>
              <li>WhatsApp: (11) 99811-5159</li>
              <li>São Paulo, SP - Brasil</li>
              <li>CNPJ: 00.000.000/0001-00</li>
            </ul>
          </div>
          
          {/* Coluna 4: Redes sociais */}
          <div>
            <h3 className="text-lg font-bold mb-4">Redes Sociais</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              App disponível em breve
            </p>
          </div>
        </div>
        
        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} HBLACKPIX. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            Desenvolvido com ❤️ no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
};
