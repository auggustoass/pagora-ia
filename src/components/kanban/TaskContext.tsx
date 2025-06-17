import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { TaskWithRelations } from '@/services/TaskService';
import { TaskStorageService } from '@/services/TaskStorageService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const initialColumns: Record<string, Column> = {
  'todo': { id: 'todo', title: 'A Fazer', taskIds: [] },
  'inProgress': { id: 'inProgress', title: 'Em Progresso', taskIds: [] },
  'review': { id: 'review', title: 'Revisão', taskIds: [] },
  'done': { id: 'done', title: 'Concluído', taskIds: [] }
};

const sampleTasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Implementar sistema de autenticação',
    description: 'Criar um sistema completo de login e registro de usuários com validação e segurança.',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
    labels: [
      { id: 'label-1', name: 'Backend', color: '#10b981' },
      { id: 'label-2', name: 'Urgente', color: '#ef4444' }
    ],
    dueDate: '2024-01-15',
    members: [
      { id: 'user-1', name: 'João Silva', email: 'joao@hblackpix.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' }
    ],
    attachments: [
      {
        id: 'att-1',
        name: 'Auth Mockup.figma',
        url: '#',
        type: 'document',
        size: 2450000,
        uploadedAt: '2024-01-10T10:00:00Z',
        uploadedBy: 'user-1'
      }
    ],
    activities: [
      {
        id: 'act-1',
        type: 'comment',
        content: 'Iniciando o desenvolvimento da autenticação. Vamos usar JWT para tokens.',
        user: { id: 'user-1', name: 'João Silva', email: 'joao@hblackpix.com' },
        createdAt: '2024-01-10T09:00:00Z'
      }
    ],
    checklist: [
      { id: 'check-1', text: 'Configurar JWT', completed: true, createdAt: '2024-01-10T08:00:00Z' },
      { id: 'check-2', text: 'Criar middleware de auth', completed: false, createdAt: '2024-01-10T08:01:00Z' },
      { id: 'check-3', text: 'Testes unitários', completed: false, createdAt: '2024-01-10T08:02:00Z' }
    ],
    columnId: 'inProgress',
    position: 0,
    archived: false,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z'
  },
  'task-2': {
    id: 'task-2',
    title: 'Design da dashboard principal',
    description: 'Criar o design e layout da dashboard principal do sistema.',
    coverImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=200&fit=crop',
    labels: [
      { id: 'label-3', name: 'Design', color: '#8b5cf6' },
      { id: 'label-4', name: 'UI/UX', color: '#06b6d4' }
    ],
    members: [
      { id: 'user-2', name: 'Maria Santos', email: 'maria@hblackpix.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b04c?w=40&h=40&fit=crop&crop=face' }
    ],
    attachments: [],
    activities: [],
    checklist: [],
    columnId: 'todo',
    position: 0,
    archived: false,
    createdAt: '2024-01-09T10:00:00Z',
    updatedAt: '2024-01-09T10:00:00Z'
  },
  'task-3': {
    id: 'task-3',
    title: 'Integração com API de pagamentos',
    description: 'Implementar integração completa com gateway de pagamento.',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop',
    labels: [
      { id: 'label-1', name: 'Backend', color: '#10b981' },
      { id: 'label-5', name: 'Integração', color: '#f59e0b' }
    ],
    members: [
      { id: 'user-1', name: 'João Silva', email: 'joao@hblackpix.com' },
      { id: 'user-3', name: 'Pedro Costa', email: 'pedro@hblackpix.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' }
    ],
    attachments: [],
    activities: [],
    checklist: [],
    columnId: 'review',
    position: 0,
    archived: false,
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-08T14:00:00Z'
  }
};

// Helper function to validate image URLs - Updated to accept base64
const isValidImageUrl = (url: string): boolean => {
  // Accept base64 image URLs
  if (url.startsWith('data:image/')) {
    console.log('Base64 image URL detected:', url.substring(0, 50) + '...');
    return true;
  }

  // Accept regular image URLs
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerUrl = url.toLowerCase();
  
  const isValid = (
    url.startsWith('http') && 
    (
      imageExtensions.some(ext => lowerUrl.includes(ext)) ||
      lowerUrl.includes('unsplash.com') ||
      lowerUrl.includes('images.') ||
      lowerUrl.includes('imgur.com') ||
      lowerUrl.includes('cloudinary.com') ||
      lowerUrl.includes('amazonaws.com')
    )
  );

  console.log('Image URL validation:', { url: url.substring(0, 50) + '...', isValid });
  return isValid;
};

// Initialize columns with sample tasks
initialColumns.todo.taskIds = ['task-2'];
initialColumns.inProgress.taskIds = ['task-1'];
initialColumns.review.taskIds = ['task-3'];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Record<string, Task>>(() => {
    const saved = localStorage.getItem('kanban-tasks');
    return saved ? JSON.parse(saved) : sampleTasks;
  });

  const [columns, setColumns] = useState<Record<string, Column>>(() => {
    const saved = localStorage.getItem('kanban-columns');
    return saved ? JSON.parse(saved) : initialColumns;
  });

  useEffect(() => {
    localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('kanban-columns', JSON.stringify(columns));
  }, [columns]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `task-${Date.now()}`;
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id,
      archived: false,
      createdAt: now,
      updatedAt: now
    };

    setTasks(prev => ({ ...prev, [id]: newTask }));
    setColumns(prev => ({
      ...prev,
      [taskData.columnId]: {
        ...prev[taskData.columnId],
        taskIds: [...prev[taskData.columnId].taskIds, id]
      }
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    console.log('updateTask called:', { taskId, updates });
    
    // Validate cover image URL if being updated
    if (updates.coverImage !== undefined) {
      if (updates.coverImage && !isValidImageUrl(updates.coverImage)) {
        console.warn('Invalid image URL provided:', updates.coverImage);
        return;
      }
      console.log('Cover image update accepted:', updates.coverImage ? updates.coverImage.substring(0, 50) + '...' : 'removed');
    }

    setTasks(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const deleteTask = (taskId: string) => {
    const task = tasks[taskId];
    if (!task) return;

    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[taskId];
      return newTasks;
    });

    setColumns(prev => ({
      ...prev,
      [task.columnId]: {
        ...prev[task.columnId],
        taskIds: prev[task.columnId].taskIds.filter(id => id !== taskId)
      }
    }));
  };

  const archiveTask = (taskId: string) => {
    const task = tasks[taskId];
    if (!task) return;

    // Remove from current column
    setColumns(prev => ({
      ...prev,
      [task.columnId]: {
        ...prev[task.columnId],
        taskIds: prev[task.columnId].taskIds.filter(id => id !== taskId)
      }
    }));

    // Mark as archived
    updateTask(taskId, { archived: true });
  };

  const unarchiveTask = (taskId: string) => {
    const task = tasks[taskId];
    if (!task) return;

    // Mark as not archived
    updateTask(taskId, { archived: false });

    // Add back to original column
    setColumns(prev => ({
      ...prev,
      [task.columnId]: {
        ...prev[task.columnId],
        taskIds: [...prev[task.columnId].taskIds, taskId]
      }
    }));
  };

  const moveTask = (taskId: string, fromColumnId: string, toColumnId: string, position: number) => {
    setColumns(prev => {
      const newColumns = { ...prev };
      
      // Remove from source column
      newColumns[fromColumnId] = {
        ...newColumns[fromColumnId],
        taskIds: newColumns[fromColumnId].taskIds.filter(id => id !== taskId)
      };

      // Add to destination column
      const destTaskIds = [...newColumns[toColumnId].taskIds];
      destTaskIds.splice(position, 0, taskId);
      newColumns[toColumnId] = {
        ...newColumns[toColumnId],
        taskIds: destTaskIds
      };

      return newColumns;
    });

    // Update task column
    updateTask(taskId, { columnId: toColumnId });
  };

  const addComment = (taskId: string, content: string) => {
    const currentUser: Member = {
      id: 'current-user',
      name: 'Usuário Atual',
      email: 'user@hblackpix.com'
    };

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      type: 'comment',
      content,
      user: currentUser,
      createdAt: new Date().toISOString()
    };

    updateTask(taskId, {
      activities: [...(tasks[taskId]?.activities || []), newActivity]
    });
  };

  const addAttachment = (taskId: string, attachmentData: Omit<Attachment, 'id' | 'uploadedAt'>) => {
    const newAttachment: Attachment = {
      ...attachmentData,
      id: `att-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };

    updateTask(taskId, {
      attachments: [...(tasks[taskId]?.attachments || []), newAttachment]
    });
  };

  const toggleChecklistItem = (taskId: string, checklistItemId: string) => {
    const task = tasks[taskId];
    if (!task) return;

    const updatedChecklist = task.checklist.map(item =>
      item.id === checklistItemId
        ? { ...item, completed: !item.completed }
        : item
    );

    updateTask(taskId, { checklist: updatedChecklist });
  };

  const addChecklistItem = (taskId: string, text: string) => {
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const task = tasks[taskId];
    if (!task) return;

    updateTask(taskId, {
      checklist: [...task.checklist, newItem]
    });
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      columns,
      loading: false,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      archiveTask,
      unarchiveTask,
      addComment,
      addAttachment,
      toggleChecklistItem,
      addChecklistItem
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
