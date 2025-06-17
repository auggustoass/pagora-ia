
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { ErrorBoundaryWithRecovery } from "@/components/ui/ErrorBoundaryWithRecovery";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Faturas from "./pages/Faturas";
import Clientes from "./pages/Clientes";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Admin from "./pages/Admin";
import Tarefas from "./pages/Tarefas";
import PendingApproval from "./pages/PendingApproval";
import Docs from "./pages/Docs";
import Ajuda from "./pages/Ajuda";
import ApiTester from "./pages/ApiTester";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ErrorBoundaryWithRecovery>
      <QueryProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>
            <AuthProvider>
              <SecurityProvider>
                <Toaster />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/pending-approval" element={<PendingApproval />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/ajuda" element={<Ajuda />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <RequireAuth>
                        <Dashboard />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/faturas" 
                    element={
                      <RequireAuth>
                        <Faturas />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/clientes" 
                    element={
                      <RequireAuth>
                        <Clientes />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/relatorios" 
                    element={
                      <RequireAuth>
                        <Relatorios />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/configuracoes" 
                    element={
                      <RequireAuth>
                        <Configuracoes />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <RequireAuth>
                        <Admin />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/tarefas" 
                    element={
                      <RequireAuth>
                        <Tarefas />
                      </RequireAuth>
                    } 
                  />
                  <Route 
                    path="/api-tester" 
                    element={
                      <RequireAuth>
                        <ApiTester />
                      </RequireAuth>
                    } 
                  />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SecurityProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundaryWithRecovery>
  );
}

export default App;
