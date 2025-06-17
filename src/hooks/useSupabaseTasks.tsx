
import { useState, useEffect } from 'react';
import { TaskService, TaskWithRelations } from '@/services/TaskService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

const initialColumns: Record<string, Column> = {
  'todo': { id: 'todo', title: 'A Fazer', taskIds: [] },
  'inProgress': { id: 'inProgress', title: 'Em Progresso', taskIds: [] },
  'review': { id: 'review', title: 'Revisão', taskIds: [] },
  'done': { id: 'done', title: 'Concluído', taskIds: [] }
};

export function useSupabaseTasks() {
  const [tasks, setTasks] = useState<Record<string, TaskWithRelations>>({});
  const [columns, setColumns] = useState<Record<string, Column>>(initialColumns);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksList = await TaskService.getAllTasks();
      
      const tasksMap: Record<string, TaskWithRelations> = {};
      const newColumns = { ...initialColumns };

      // Reset taskIds
      Object.keys(newColumns).forEach(columnId => {
        newColumns[columnId].taskIds = [];
      });

      tasksList.forEach(task => {
        tasksMap[task.id] = task;
        if (newColumns[task.column_id]) {
          newColumns[task.column_id].taskIds.push(task.id);
        }
      });

      // Ordenar taskIds por position
      Object.keys(newColumns).forEach(columnId => {
        newColumns[columnId].taskIds.sort((a, b) => {
          const taskA = tasksMap[a];
          const taskB = tasksMap[b];
          return (taskA?.position || 0) - (taskB?.position || 0);
        });
      });

      setTasks(tasksMap);
      setColumns(newColumns);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    // Configurar real-time subscriptions
    const tasksSubscription = supabase
      .channel('tasks-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        () => loadTasks()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'task_labels' },
        () => loadTasks()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'task_members' },
        () => loadTasks()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'task_attachments' },
        () => loadTasks()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'task_activities' },
        () => loadTasks()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'task_checklist' },
        () => loadTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, []);

  const addTask = async (taskData: {
    title: string;
    description?: string;
    columnId: string;
    coverImage?: string;
    labels?: { name: string; color: string }[];
    members?: { name: string; email: string; avatar?: string }[];
  }) => {
    try {
      const newTask = await TaskService.createTask({
        title: taskData.title,
        description: taskData.description || '',
        column_id: taskData.columnId as any,
        cover_image_url: taskData.coverImage,
        position: columns[taskData.columnId]?.taskIds.length || 0
      });

      // Adicionar labels se fornecidos
      if (taskData.labels && taskData.labels.length > 0) {
        for (const label of taskData.labels) {
          await TaskService.addLabel(newTask.id, label.name, label.color);
        }
      }

      // Adicionar membros se fornecidos
      if (taskData.members && taskData.members.length > 0) {
        for (const member of taskData.members) {
          await TaskService.addMember(newTask.id, member.name, member.email, member.avatar);
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso!'
      });

      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa.',
        variant: 'destructive'
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<TaskWithRelations>) => {
    try {
      await TaskService.updateTask(taskId, updates);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive'
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await TaskService.deleteTask(taskId);
      toast({
        title: 'Sucesso',
        description: 'Tarefa excluída com sucesso!'
      });
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa.',
        variant: 'destructive'
      });
    }
  };

  const moveTask = async (taskId: string, fromColumnId: string, toColumnId: string, newPosition: number) => {
    try {
      await TaskService.moveTask(taskId, toColumnId, newPosition);
      await loadTasks();
    } catch (error) {
      console.error('Error moving task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível mover a tarefa.',
        variant: 'destructive'
      });
    }
  };

  const archiveTask = async (taskId: string) => {
    try {
      await TaskService.updateTask(taskId, { archived: true });
      await loadTasks();
    } catch (error) {
      console.error('Error archiving task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível arquivar a tarefa.',
        variant: 'destructive'
      });
    }
  };

  const unarchiveTask = async (taskId: string) => {
    try {
      await TaskService.updateTask(taskId, { archived: false });
      await loadTasks();
    } catch (error) {
      console.error('Error unarchiving task:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desarquivar a tarefa.',
        variant: 'destructive'
      });
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      await TaskService.addActivity(taskId, content, 'comment');
      await loadTasks();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário.',
        variant: 'destructive'
      });
    }
  };

  const addChecklistItem = async (taskId: string, text: string) => {
    try {
      await TaskService.addChecklistItem(taskId, text);
      await loadTasks();
    } catch (error) {
      console.error('Error adding checklist item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o item da checklist.',
        variant: 'destructive'
      });
    }
  };

  const toggleChecklistItem = async (taskId: string, checklistItemId: string) => {
    try {
      const task = tasks[taskId];
      const item = task?.checklist.find(item => item.id === checklistItemId);
      if (item) {
        await TaskService.toggleChecklistItem(checklistItemId, !item.completed);
        await loadTasks();
      }
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o item da checklist.',
        variant: 'destructive'
      });
    }
  };

  return {
    tasks,
    columns,
    loading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    archiveTask,
    unarchiveTask,
    addComment,
    addChecklistItem,
    toggleChecklistItem,
    loadTasks
  };
}
