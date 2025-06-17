
-- FASE 1: REMOÇÃO IMEDIATA - Deletar tabela rate_limit_attempts (vazia e não usada)
DROP TABLE IF EXISTS public.rate_limit_attempts;

-- FASE 2: CONSOLIDAÇÃO - Remover tabela duplicada de credenciais do Mercado Pago
-- Primeiro verificar se admin_mercado_pago_credentials tem dados únicos
-- Se não tiver dados importantes, removemos ela para usar apenas mercado_pago_credentials
DROP TABLE IF EXISTS public.admin_mercado_pago_credentials;

-- FASE 3: LIMPEZA DE DADOS ANTIGOS - Implementar limpeza automática de logs de segurança
-- Manter apenas os últimos 90 dias de logs de auditoria de segurança
DELETE FROM public.security_audit_log 
WHERE created_at < NOW() - INTERVAL '90 days';

-- FASE 4: OTIMIZAÇÃO - Remover advanced_rate_limits se não está sendo usada
-- Esta tabela parece não estar sendo utilizada pelo código atual
DROP TABLE IF EXISTS public.advanced_rate_limits;

-- Criar função para limpeza automática de logs antigos (executar mensalmente)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar logs de auditoria mais antigos que 90 dias
  DELETE FROM public.security_audit_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log da limpeza realizada
  RAISE NOTICE 'Limpeza de logs antigos concluída: %', NOW();
END;
$$;

-- Criar índice para melhorar performance das consultas por data nos logs
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at 
ON public.security_audit_log(created_at);

-- Criar índice para melhorar performance das consultas por usuário nos logs
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id 
ON public.security_audit_log(user_id);
