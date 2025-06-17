
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Task = Tables<'tasks'>;
export type TaskInsert = TablesInsert<'tasks'>;
export type TaskUpdate = TablesUpdate<'tasks'>;

export type TaskLabel = Tables<'task_labels'>;
export type TaskMember = Tables<'task_members'>;
export type TaskAttachment = Tables<'task_attachments'>;
export type TaskActivity = Tables<'task_activities'>;
export type TaskChecklist = Tables<'task_checklist'>;

export interface TaskWithRelations extends Task {
  labels: TaskLabel[];
  members: TaskMember[];
  attachments: TaskAttachment[];
  activities: TaskActivity[];
  checklist: TaskChecklist[];
}

export class TaskService {
  static async getAllTasks(): Promise<TaskWithRelations[]> {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_labels (*),
        task_members (*),
        task_attachments (*),
        task_activities (*),
        task_checklist (*)
      `)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return tasks.map(task => ({
      ...task,
      labels: task.task_labels || [],
      members: task.task_members || [],
      attachments: task.task_attachments || [],
      activities: task.task_activities || [],
      checklist: task.task_checklist || []
    }));
  }

  static async createTask(taskData: Omit<TaskInsert, 'user_id'>): Promise<TaskWithRelations> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, user_id: user.id })
      .select(`
        *,
        task_labels (*),
        task_members (*),
        task_attachments (*),
        task_activities (*),
        task_checklist (*)
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return {
      ...task,
      labels: task.task_labels || [],
      members: task.task_members || [],
      attachments: task.task_attachments || [],
      activities: task.task_activities || [],
      checklist: task.task_checklist || []
    };
  }

  static async updateTask(taskId: string, updates: TaskUpdate): Promise<TaskWithRelations> {
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select(`
        *,
        task_labels (*),
        task_members (*),
        task_attachments (*),
        task_activities (*),
        task_checklist (*)
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return {
      ...task,
      labels: task.task_labels || [],
      members: task.task_members || [],
      attachments: task.task_attachments || [],
      activities: task.task_activities || [],
      checklist: task.task_checklist || []
    };
  }

  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  static async moveTask(taskId: string, newColumnId: string, newPosition: number): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        column_id: newColumnId as any,
        position: newPosition 
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  }

  static async addLabel(taskId: string, name: string, color: string): Promise<TaskLabel> {
    const { data: label, error } = await supabase
      .from('task_labels')
      .insert({ task_id: taskId, name, color })
      .select()
      .single();

    if (error) {
      console.error('Error adding label:', error);
      throw error;
    }

    return label;
  }

  static async addMember(taskId: string, name: string, email: string, avatar_url?: string): Promise<TaskMember> {
    const { data: member, error } = await supabase
      .from('task_members')
      .insert({ task_id: taskId, name, email, avatar_url })
      .select()
      .single();

    if (error) {
      console.error('Error adding member:', error);
      throw error;
    }

    return member;
  }

  static async addActivity(taskId: string, content: string, type: 'comment' | 'action' = 'comment'): Promise<TaskActivity> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: activity, error } = await supabase
      .from('task_activities')
      .insert({
        task_id: taskId,
        type,
        content,
        user_id: user.id,
        user_name: user.user_metadata?.first_name || 'Usuário',
        user_email: user.email || '',
        user_avatar_url: user.user_metadata?.avatar_url
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding activity:', error);
      throw error;
    }

    return activity;
  }

  static async addChecklistItem(taskId: string, text: string): Promise<TaskChecklist> {
    const { data: item, error } = await supabase
      .from('task_checklist')
      .insert({ task_id: taskId, text })
      .select()
      .single();

    if (error) {
      console.error('Error adding checklist item:', error);
      throw error;
    }

    return item;
  }

  static async toggleChecklistItem(itemId: string, completed: boolean): Promise<TaskChecklist> {
    const { data: item, error } = await supabase
      .from('task_checklist')
      .update({ completed })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling checklist item:', error);
      throw error;
    }

    return item;
  }
}
