import React, { useState } from 'react';
import { Column, useTask } from './TaskContext';
import { TaskCard } from './TaskCard';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  column: Column;
  isDraggingOver: boolean;
}

export function KanbanColumn({ column, isDraggingOver }: KanbanColumnProps) {
  const { tasks, columns, moveTask } = useTask();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter out archived tasks
  const columnTasks = column.taskIds
    .map(taskId => tasks[taskId])
    .filter(task => task && !task.archived);

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'todo': return 'bg-gray-500';
      case 'inProgress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 p-3 bg-[#1a1a1a] rounded-lg border border-gray-800">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getColumnColor(column.id)}`}></div>
          <h3 className="font-semibold text-white text-sm">{column.title}</h3>
        </div>
        <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
          {columnTasks.length}
        </Badge>
      </div>

      <div className={`flex-1 space-y-3 p-2 rounded-lg transition-colors ${
        isDraggingOver ? 'bg-gray-800/30' : ''
      }`}>
        {columnTasks.map((task, index) => (
          <TaskCard key={task.id} task={task} index={index} />
        ))}
      </div>
    </div>
  );
}
