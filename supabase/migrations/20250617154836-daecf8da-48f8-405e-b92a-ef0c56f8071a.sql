
-- FASE CRÍTICA 1: Implementar RLS completo nas tabelas de tarefas
-- Estas políticas já existem mas vamos garantir que estão corretas

-- Verificar e corrigir políticas para task_labels
DROP POLICY IF EXISTS "Users can view own task labels" ON public.task_labels;
DROP POLICY IF EXISTS "Users can manage own task labels" ON public.task_labels;

CREATE POLICY "secure_task_labels_select" ON public.task_labels
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "secure_task_labels_all" ON public.task_labels
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

-- Verificar e corrigir políticas para task_members
DROP POLICY IF EXISTS "Users can view own task members" ON public.task_members;
DROP POLICY IF EXISTS "Users can manage own task members" ON public.task_members;

CREATE POLICY "secure_task_members_select" ON public.task_members
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "secure_task_members_all" ON public.task_members
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

-- Verificar e corrigir políticas para task_attachments
DROP POLICY IF EXISTS "Users can view own task attachments" ON public.task_attachments;
DROP POLICY IF EXISTS "Users can manage own task attachments" ON public.task_attachments;

CREATE POLICY "secure_task_attachments_select" ON public.task_attachments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "secure_task_attachments_all" ON public.task_attachments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

-- Verificar e corrigir políticas para task_activities
DROP POLICY IF EXISTS "Users can view own task activities" ON public.task_activities;
DROP POLICY IF EXISTS "Users can create task activities" ON public.task_activities;

CREATE POLICY "secure_task_activities_select" ON public.task_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "secure_task_activities_insert" ON public.task_activities
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ) AND auth.uid() = user_id);

-- Verificar e corrigir políticas para task_checklist
DROP POLICY IF EXISTS "Users can view own task checklist" ON public.task_checklist;
DROP POLICY IF EXISTS "Users can manage own task checklist" ON public.task_checklist;

CREATE POLICY "secure_task_checklist_select" ON public.task_checklist
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "secure_task_checklist_all" ON public.task_checklist
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

-- FASE CRÍTICA 2: Adicionar função para criptografia de credenciais
CREATE OR REPLACE FUNCTION public.encrypt_credential(credential_text text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Implementação básica de criptografia usando built-in do PostgreSQL
  RETURN encode(encrypt(credential_text::bytea, encryption_key::bytea, 'aes'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_credential(encrypted_text text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Implementação básica de descriptografia
  RETURN convert_from(decrypt(decode(encrypted_text, 'base64'), encryption_key::bytea, 'aes'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL; -- Retorna NULL se não conseguir descriptografar
END;
$$;

-- FASE ALTA: Expandir sistema de auditoria com tracking de IP
-- Função melhorada para log de segurança com mais detalhes
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid, 
  p_event_type text, 
  p_event_details jsonb DEFAULT NULL::jsonb, 
  p_ip_address text DEFAULT NULL::text, 
  p_user_agent text DEFAULT NULL::text,
  p_session_id text DEFAULT NULL::text,
  p_risk_level text DEFAULT 'low'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    jsonb_build_object(
      'details', p_event_details,
      'session_id', p_session_id,
      'risk_level', p_risk_level,
      'timestamp', now()
    ),
    p_ip_address::INET,
    p_user_agent
  );
END;
$$;

-- Função para detectar múltiplos logins suspeitos
CREATE OR REPLACE FUNCTION public.detect_suspicious_login_pattern(p_user_id uuid, p_ip_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_ips_count INTEGER;
  recent_failed_attempts INTEGER;
BEGIN
  -- Contar IPs únicos nas últimas 2 horas
  SELECT COUNT(DISTINCT ip_address) INTO recent_ips_count
  FROM public.security_audit_log
  WHERE user_id = p_user_id
    AND created_at > now() - interval '2 hours'
    AND event_type ILIKE '%LOGIN%';
    
  -- Contar tentativas falhas nas últimas 30 minutos
  SELECT COUNT(*) INTO recent_failed_attempts
  FROM public.security_audit_log
  WHERE user_id = p_user_id
    AND created_at > now() - interval '30 minutes'
    AND event_type ILIKE '%FAILED%';
  
  -- Retorna true se detectar padrão suspeito
  RETURN recent_ips_count > 3 OR recent_failed_attempts > 5;
END;
$$;

-- FASE MÉDIA: Rate limiting avançado por usuário e IP
CREATE TABLE IF NOT EXISTS public.advanced_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  action_type text NOT NULL,
  attempts_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users,
  ip_address inet,
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.advanced_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_can_manage_rate_limits" ON public.advanced_rate_limits
  FOR ALL USING (true);

-- Função de rate limiting avançado
CREATE OR REPLACE FUNCTION public.check_advanced_rate_limit(
  p_identifier text,
  p_action_type text,
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_max_attempts integer DEFAULT 10,
  p_window_minutes integer DEFAULT 15
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_attempts INTEGER;
  is_blocked BOOLEAN DEFAULT FALSE;
  block_expires_at TIMESTAMP;
  window_start TIMESTAMP;
BEGIN
  window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Verificar se há bloqueio ativo
  SELECT blocked_until INTO block_expires_at
  FROM public.advanced_rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND blocked_until > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF block_expires_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'blocked', TRUE,
      'blocked_until', block_expires_at,
      'reason', 'Rate limit exceeded - blocked'
    );
  END IF;
  
  -- Contar tentativas na janela atual
  SELECT COALESCE(SUM(attempts_count), 0) INTO current_attempts
  FROM public.advanced_rate_limits
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND window_start > window_start;
  
  -- Registrar esta tentativa
  INSERT INTO public.advanced_rate_limits (
    identifier, action_type, user_id, ip_address, window_start
  ) VALUES (
    p_identifier, p_action_type, p_user_id, p_ip_address::inet, NOW()
  );
  
  -- Verificar se excedeu o limite
  IF current_attempts >= p_max_attempts THEN
    -- Bloquear por 1 hora
    UPDATE public.advanced_rate_limits
    SET blocked_until = NOW() + interval '1 hour'
    WHERE identifier = p_identifier
      AND action_type = p_action_type
      AND blocked_until IS NULL;
      
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'blocked', TRUE,
      'attempts', current_attempts + 1,
      'max_attempts', p_max_attempts,
      'reason', 'Rate limit exceeded - now blocked'
    );
  END IF;
  
  -- Limpar tentativas antigas
  DELETE FROM public.advanced_rate_limits
  WHERE window_start < window_start
    OR (blocked_until IS NOT NULL AND blocked_until < NOW());
  
  RETURN jsonb_build_object(
    'allowed', TRUE,
    'blocked', FALSE,
    'attempts', current_attempts + 1,
    'max_attempts', p_max_attempts
  );
END;
$$;
