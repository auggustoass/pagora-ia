
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const NavBar = () => {
  const { user } = useAuth();

  return (
    <header className="w-full border-b border-border/40 backdrop-blur-sm bg-background/80 fixed top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-gradient text-glow">HBLACKPIX</h1>
        </Link>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {user ? (
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link to="/dashboard">
                Acessar Dashboard
              </Link>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button asChild variant="outline">
                <Link to="/auth">
                  Entrar
                </Link>
              </Button>
              <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
                <Link to="/auth?tab=signup">
                  Criar Conta
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
