
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SecurityService } from '@/services/SecurityService';

interface AuthFormProps {
  initialTab?: string;
}

export function AuthForm({ initialTab = 'login' }: AuthFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const isRejected = searchParams.get('rejected') === 'true';
  
  useEffect(() => {
    if (isRejected) {
      toast.error('Sua conta foi rejeitada pelo administrador. Entre em contato para mais informações.');
    }
  }, [isRejected]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting for login attempts
    if (!SecurityService.checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000)) {
      toast.error('Muitas tentativas de login. Tente novamente em 15 minutos.');
      return;
    }
    
    // Validate inputs
    if (!SecurityService.isValidEmail(email)) {
      toast.error('Email inválido');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    try {
      // Sanitize inputs
      const sanitizedEmail = SecurityService.sanitizeInput(email.toLowerCase().trim());
      
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      });
      
      if (error) {
        setLoginAttempts(prev => prev + 1);
        console.error('Login error:', SecurityService.cleanSensitiveData(error));
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciais inválidas');
        } else {
          toast.error('Erro ao fazer login');
        }
      } else {
        toast.success('Login realizado com sucesso!');
        // Clear any rate limiting data on successful login
        localStorage.removeItem(`rate_limit_login_${email}`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', SecurityService.cleanSensitiveData(error));
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting for signup attempts
    if (!SecurityService.checkRateLimit('signup', 3, 60 * 60 * 1000)) {
      toast.error('Muitas tentativas de cadastro. Tente novamente em 1 hora.');
      return;
    }
    
    // Validate inputs
    if (!SecurityService.isValidEmail(email)) {
      toast.error('Email inválido');
      return;
    }
    
    if (!SecurityService.isValidPhone(phone)) {
      toast.error('Telefone inválido');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    if (firstName.length < 2 || lastName.length < 2) {
      toast.error('Nome e sobrenome são obrigatórios');
      return;
    }
    
    setLoading(true);
    try {
      // Sanitize inputs
      const sanitizedData = SecurityService.sanitizeInput({
        email: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.replace(/\D/g, '')
      });
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password,
        options: {
          data: {
            first_name: sanitizedData.firstName,
            last_name: sanitizedData.lastName,
            phone: sanitizedData.phone
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', SecurityService.cleanSensitiveData(error));
        
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error('Erro ao criar conta');
        }
      } else {
        toast.success('Cadastro realizado com sucesso! Sua conta está sendo analisada pela nossa equipe.');
        // Clear form
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
      }
    } catch (error) {
      console.error('Signup error:', SecurityService.cleanSensitiveData(error));
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-card/60 backdrop-blur-md border-border rounded-2xl shadow-xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pagora-green via-pagora-darkGreen to-transparent"></div>
      
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center font-bold">
          <span className="text-gradient text-glow">HBLACKPIX</span>
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Assistente de Cobrança Inteligente
        </CardDescription>
      </CardHeader>
      
      {isRejected && (
        <div className="px-6 pb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sua conta foi rejeitada pelo administrador. Entre em contato conosco para mais informações.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <Tabs defaultValue={initialTab} className="w-full">
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
                  className="bg-secondary/40 border-border h-10 focus:border-primary/50"
                  required 
                  maxLength={100}
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="bg-secondary/40 border-border h-10 focus:border-primary/50"
                  required 
                  minLength={6}
                  maxLength={100}
                  autoComplete="current-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pagora-green to-pagora-darkGreen text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader size={16} className="animate-spin mr-2" />
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                📋 Sua conta será analisada pela nossa equipe antes da aprovação.
              </p>
            </div>
            
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">Nome</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    className="bg-secondary/40 border-border h-10 focus:border-primary/50"
                    required 
                    maxLength={50}
                    autoComplete="given-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">Sobrenome</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className="bg-secondary/40 border-border h-10 focus:border-primary/50"
                    required 
                    maxLength={50}
                    autoComplete="family-name"
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
                  className="bg-secondary/40 border-border h-10 focus:border-primary/50"
                  required 
                  maxLength={100}
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  type="tel" 
                  placeholder="11999999999" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="bg-secondary/40 border-border h-10 focus:border-primary/50"
                  required 
                  maxLength={20}
                  autoComplete="tel"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signupPassword" className="text-sm font-medium">Senha</Label>
                <Input 
                  id="signupPassword" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="bg-secondary/40 border-border h-10 focus:border-primary/50"
                  required 
                  minLength={8}
                  maxLength={100}
                  autoComplete="new-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pagora-green to-pagora-darkGreen text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader size={16} className="animate-spin mr-2" />
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
