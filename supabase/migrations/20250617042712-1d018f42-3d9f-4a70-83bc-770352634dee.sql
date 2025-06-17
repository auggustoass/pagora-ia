
-- Criar enum para status das tarefas
CREATE TYPE task_status AS ENUM ('todo', 'inProgress', 'review', 'done');

-- Criar enum para tipos de atividade
CREATE TYPE activity_type AS ENUM ('comment', 'action');

-- Criar enum para tipos de anexo
CREATE TYPE attachment_type AS ENUM ('image', 'document', 'link');

-- Tabela principal de tarefas
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image_url TEXT,
  due_date DATE,
  column_id task_status NOT NULL DEFAULT 'todo',
  position INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de etiquetas das tarefas
CREATE TABLE public.task_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de membros das tarefas
CREATE TABLE public.task_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de anexos das tarefas
CREATE TABLE public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type attachment_type NOT NULL,
  size_bytes INTEGER,
  uploaded_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de atividades das tarefas
CREATE TABLE public.task_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  type activity_type NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de checklist das tarefas
CREATE TABLE public.task_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar bucket para imagens de capa das tarefas
INSERT INTO storage.buckets (id, name, public) VALUES ('task-covers', 'task-covers', true);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklist ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tasks - usuários só veem suas próprias tarefas
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tasks" ON public.tasks
  FOR ALL USING (public.is_admin_user());

-- Políticas RLS para task_labels
CREATE POLICY "Users can view own task labels" ON public.task_labels
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own task labels" ON public.task_labels
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

-- Políticas RLS para task_members
CREATE POLICY "Users can view own task members" ON public.task_members
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own task members" ON public.task_members
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

-- Políticas RLS para task_attachments
CREATE POLICY "Users can view own task attachments" ON public.task_attachments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own task attachments" ON public.task_attachments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

-- Políticas RLS para task_activities
CREATE POLICY "Users can view own task activities" ON public.task_activities
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create task activities" ON public.task_activities
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ) AND auth.uid() = user_id);

-- Políticas RLS para task_checklist
CREATE POLICY "Users can view own task checklist" ON public.task_checklist
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own task checklist" ON public.task_checklist
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.tasks WHERE id = task_id AND user_id = auth.uid()
  ));

-- Políticas para storage bucket task-covers
CREATE POLICY "Users can upload task covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-covers' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view task covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'task-covers');

CREATE POLICY "Users can update own task covers" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'task-covers' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own task covers" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'task-covers' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Índices para melhor performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_column_id ON public.tasks(column_id);
CREATE INDEX idx_tasks_position ON public.tasks(position);
CREATE INDEX idx_task_labels_task_id ON public.task_labels(task_id);
CREATE INDEX idx_task_members_task_id ON public.task_members(task_id);
CREATE INDEX idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX idx_task_activities_task_id ON public.task_activities(task_id);
CREATE INDEX idx_task_checklist_task_id ON public.task_checklist(task_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela tasks
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON public.tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
