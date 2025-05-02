
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Clientes from "./pages/Clientes";
import Faturas from "./pages/Faturas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Ajuda from "./pages/Ajuda";
import Auth from "./pages/Auth";
import Planos from "./pages/Planos";
import Admin from "./pages/Admin";
import PlanosObrigado from "./pages/PlanosObrigado";
import ConfiguracoesAssinatura from "./pages/ConfiguracoesAssinatura";
import Assistente from "./pages/Assistente";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="pagora-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <RequireAuth>
                  <Index />
                </RequireAuth>
              } />
              <Route path="/clientes" element={
                <RequireAuth>
                  <Clientes />
                </RequireAuth>
              } />
              <Route path="/faturas" element={
                <RequireAuth>
                  <Faturas />
                </RequireAuth>
              } />
              <Route path="/relatorios" element={
                <RequireAuth>
                  <Relatorios />
                </RequireAuth>
              } />
              <Route path="/configuracoes" element={
                <RequireAuth>
                  <Configuracoes />
                </RequireAuth>
              } />
              <Route path="/configuracoes/assinatura" element={
                <RequireAuth>
                  <ConfiguracoesAssinatura />
                </RequireAuth>
              } />
              <Route path="/ajuda" element={
                <RequireAuth>
                  <Ajuda />
                </RequireAuth>
              } />
              <Route path="/assistente" element={
                <RequireAuth>
                  <Assistente />
                </RequireAuth>
              } />
              <Route path="/planos" element={<Planos />} />
              <Route path="/planos/obrigado" element={<PlanosObrigado />} />
              <Route path="/admin" element={<Admin />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
