
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader } from 'lucide-react';

export function AuthForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone // Store phone in user metadata
          }
        }
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Cadastro realizado com sucesso! Verifique seu email.');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
      }
    } catch (error) {
      toast.error('Erro ao criar conta');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/60 backdrop-blur-md border-white/5 rounded-2xl shadow-xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pagora-purple via-pagora-blue to-transparent"></div>
      
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center font-bold">
          <span className="text-gradient text-glow">HBLACKPIX</span>
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Assistente de Cobrança Inteligente
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 rounded-lg bg-secondary/40">
          <TabsTrigger 
            value="login" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
          >
            Login
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
          >
            Cadastro
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="bg-secondary/40 border-white/5 h-10 focus:border-primary/50"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                  <a href="#" className="text-xs text-muted-foreground hover:text-primary">
                    Esqueceu a senha?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="bg-secondary/40 border-white/5 h-10 focus:border-primary/50"
                  required 
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pagora-purple to-pagora-blue text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader size={16} className="animate-spinner mr-2" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <span>Entrar</span>
                )}
              </Button>
            </form>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="signup">
          <CardContent className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">Nome</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    className="bg-secondary/40 border-white/5 h-10 focus:border-primary/50"
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Sobrenome</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="bg-secondary/40 border-white/5 h-10 focus:border-primary/50"
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupEmail" className="text-sm font-medium">Email</Label>
                <Input 
                  id="signupEmail" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="bg-secondary/40 border-white/5 h-10 focus:border-primary/50"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  type="tel" 
                  placeholder="+5511999999999" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="bg-secondary/40 border-white/5 h-10 focus:border-primary/50"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupPassword" className="text-sm font-medium">Senha</Label>
                <Input 
                  id="signupPassword" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="bg-secondary/40 border-white/5 h-10 focus:border-primary/50"
                  required 
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pagora-purple to-pagora-blue text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader size={16} className="animate-spinner mr-2" />
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  <span>Criar conta</span>
                )}
              </Button>
            </form>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-center pt-2 pb-6">
        <p className="text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
        </p>
      </CardFooter>
    </Card>
  );
}
