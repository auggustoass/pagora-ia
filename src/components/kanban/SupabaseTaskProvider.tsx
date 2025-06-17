
import React, { createContext, useContext } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { TaskWithRelations } from '@/services/TaskService';

export interface Task {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  labels: Label[];
  dueDate?: string;
  members: Member[];
  attachments: Attachment[];
  activities: Activity[];
  checklist: ChecklistItem[];
  columnId: string;
  position: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link';
  size?: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Activity {
  id: string;
  type: 'comment' | 'action';
  content: string;
  user: Member;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface TaskContextType {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, position: number) => void;
  archiveTask: (taskId: string) => void;
  unarchiveTask: (taskId: string) => void;
  addComment: (taskId: string, content: string) => void;
  addAttachment: (taskId: string, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => void;
  toggleChecklistItem: (taskId: string, checklistItemId: string) => void;
  addChecklistItem: (taskId: string, text: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Transform Supabase data to frontend format
const transformSupabaseTask = (supabaseTask: TaskWithRelations): Task => ({
  id: supabaseTask.id,
  title: supabaseTask.title,
  description: supabaseTask.description || '',
  coverImage: supabaseTask.cover_image_url || undefined,
  labels: supabaseTask.labels.map(label => ({
    id: label.id,
    name: label.name,
    color: label.color
  })),
  dueDate: supabaseTask.due_date || undefined,
  members: supabaseTask.members.map(member => ({
    id: member.id,
    name: member.name,
    email: member.email,
    avatar: member.avatar_url || undefined
  })),
  attachments: supabaseTask.attachments.map(att => ({
    id: att.id,
    name: att.name,
    url: att.url,
    type: att.type,
    size: att.size_bytes || undefined,
    uploadedAt: att.created_at,
    uploadedBy: att.uploaded_by
  })),
  activities: supabaseTask.activities.map(act => ({
    id: act.id,
    type: act.type,
    content: act.content,
    user: {
      id: act.user_id,
      name: act.user_name,
      email: act.user_email,
      avatar: act.user_avatar_url || undefined
    },
    createdAt: act.created_at
  })),
  checklist: supabaseTask.checklist.map(item => ({
    id: item.id,
    text: item.text,
    completed: item.completed,
    createdAt: item.created_at
  })),
  columnId: supabaseTask.column_id,
  position: supabaseTask.position,
  archived: supabaseTask.archived,
  createdAt: supabaseTask.created_at,
  updatedAt: supabaseTask.updated_at
});

export function SupabaseTaskProvider({ children }: { children: React.ReactNode }) {
  const supabaseTasks = useSupabaseTasks();

  // Transform Supabase tasks to frontend format
  const transformedTasks = React.useMemo(() => {
    const result: Record<string, Task> = {};
    Object.values(supabaseTasks.tasks).forEach(task => {
      result[task.id] = transformSupabaseTask(task);
    });
    return result;
  }, [supabaseTasks.tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    supabaseTasks.addTask({
      title: taskData.title,
      description: taskData.description,
      columnId: taskData.columnId,
      coverImage: taskData.coverImage,
      labels: taskData.labels,
      members: taskData.members
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    // Convert frontend updates to Supabase format
    const supabaseUpdates: Partial<TaskWithRelations> = {};
    
    if (updates.title !== undefined) supabaseUpdates.title = updates.title;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.coverImage !== undefined) supabaseUpdates.cover_image_url = updates.coverImage;
    if (updates.dueDate !== undefined) supabaseUpdates.due_date = updates.dueDate;
    if (updates.archived !== undefined) supabaseUpdates.archived = updates.archived;

    supabaseTasks.updateTask(taskId, supabaseUpdates);
  };

  const addAttachment = (taskId: string, attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => {
    // This would need to be implemented in the Supabase service
    console.log('Adding attachment:', { taskId, attachment });
  };

  return (
    <TaskContext.Provider value={{
      tasks: transformedTasks,
      columns: supabaseTasks.columns,
      loading: supabaseTasks.loading,
      addTask,
      updateTask,
      deleteTask: supabaseTasks.deleteTask,
      moveTask: supabaseTasks.moveTask,
      archiveTask: supabaseTasks.archiveTask,
      unarchiveTask: supabaseTasks.unarchiveTask,
      addComment: supabaseTasks.addComment,
      addAttachment,
      toggleChecklistItem: supabaseTasks.toggleChecklistItem,
      addChecklistItem: supabaseTasks.addChecklistItem
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a SupabaseTaskProvider');
  }
  return context;
}
