
-- Criar função segura para verificar se é admin (evita recursão)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Remove todas as políticas existentes das tabelas
DROP POLICY IF EXISTS "Users can view own faturas" ON public.faturas;
DROP POLICY IF EXISTS "Users can create own faturas" ON public.faturas;
DROP POLICY IF EXISTS "Users can update own faturas" ON public.faturas;
DROP POLICY IF EXISTS "Admins can view all faturas" ON public.faturas;
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can create own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_invoice_credits;
DROP POLICY IF EXISTS "Admins can manage all credits" ON public.user_invoice_credits;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own mp credentials" ON public.mercado_pago_credentials;
DROP POLICY IF EXISTS "Users can manage own mp credentials" ON public.mercado_pago_credentials;
DROP POLICY IF EXISTS "Admins can view all mp credentials" ON public.mercado_pago_credentials;
DROP POLICY IF EXISTS "Only admins can access settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can view security logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Anyone can insert security logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limit_attempts;

-- Habilitar RLS em todas as tabelas críticas
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invoice_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mercado_pago_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas seguras para faturas - apenas o próprio usuário pode ver suas faturas
CREATE POLICY "secure_faturas_select" ON public.faturas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "secure_faturas_insert" ON public.faturas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "secure_faturas_update" ON public.faturas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "secure_faturas_admin" ON public.faturas
  FOR ALL USING (public.is_admin_user());

-- Políticas seguras para clientes - apenas o próprio usuário pode ver seus clientes
CREATE POLICY "secure_clients_select" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "secure_clients_insert" ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "secure_clients_update" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "secure_clients_admin" ON public.clients
  FOR ALL USING (public.is_admin_user());

-- Políticas seguras para créditos - apenas o próprio usuário pode ver seus créditos
CREATE POLICY "secure_credits_select" ON public.user_invoice_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "secure_credits_admin" ON public.user_invoice_credits
  FOR ALL USING (public.is_admin_user());

-- Políticas seguras para notificações - apenas o próprio usuário pode ver suas notificações
CREATE POLICY "secure_notifications_select" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "secure_notifications_update" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "secure_notifications_admin" ON public.notifications
  FOR ALL USING (public.is_admin_user());

-- Políticas seguras para credenciais do Mercado Pago - apenas o próprio usuário
CREATE POLICY "secure_mp_credentials_select" ON public.mercado_pago_credentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "secure_mp_credentials_all" ON public.mercado_pago_credentials
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "secure_mp_credentials_admin" ON public.mercado_pago_credentials
  FOR SELECT USING (public.is_admin_user());

-- Política restritiva para settings - apenas admins
CREATE POLICY "secure_settings_admin_only" ON public.settings
  FOR ALL USING (public.is_admin_user());

-- Políticas para tabelas de auditoria - apenas admins podem ver
CREATE POLICY "secure_audit_admin_select" ON public.security_audit_log
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "secure_audit_insert" ON public.security_audit_log
  FOR INSERT WITH CHECK (true);

-- Política para rate limiting - qualquer um pode inserir, apenas sistema pode ler
CREATE POLICY "secure_rate_limit_all" ON public.rate_limit_attempts
  FOR ALL USING (true);
