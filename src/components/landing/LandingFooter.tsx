
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Coluna 1: Logo e texto */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gradient text-glow">HBLACKPIX</h2>
            <p className="text-muted-foreground">
              Assistente de cobranças inteligente com WhatsApp e Pix para sua empresa.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Coluna 2: Links rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/planos" className="text-muted-foreground hover:text-primary transition-colors">Planos</Link></li>
              <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Login</Link></li>
              <li><Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">Cadastro</Link></li>
            </ul>
          </div>
          
          {/* Coluna 3: Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Termos de Serviço</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Política de Cookies</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Segurança</a></li>
            </ul>
          </div>
          
          {/* Coluna 4: Contato */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>suporte@hblackpix.com</li>
              <li>WhatsApp: (11) 99811-5159</li>
              <li>São Paulo, SP - Brasil</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} HBLACKPIX. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            Desenvolvido com ❤️ no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
};
