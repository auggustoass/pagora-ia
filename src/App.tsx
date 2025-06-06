
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";

import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Clientes from "./pages/Clientes";
import Faturas from "./pages/Faturas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Ajuda from "./pages/Ajuda";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ApiTester from "./pages/ApiTester";
import PendingApproval from "./pages/PendingApproval";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="hblackpix-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Redirect root to dashboard if logged in, otherwise to auth */}
              <Route path="/" element={
                <RequireAuth redirectTo="/auth">
                  <Navigate to="/dashboard" replace />
                </RequireAuth>
              } />
              <Route path="/auth" element={<Auth />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <RequireAuth>
                  <Dashboard />
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
              <Route path="/ajuda" element={
                <RequireAuth>
                  <Ajuda />
                </RequireAuth>
              } />
              <Route path="/admin" element={<Admin />} />
              <Route path="/api-tester" element={
                <RequireAuth>
                  <ApiTester />
                </RequireAuth>
              } />
              
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
