
import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task } from './TaskContext';
import { TaskModal } from './TaskModal';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const completedChecklist = task.checklist.filter(item => item.completed).length;
  const totalChecklist = task.checklist.length;

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-[#1e1e1e] rounded-lg border border-gray-800 cursor-pointer transition-all hover:border-gray-600 ${
              snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
            }`}
            onClick={() => setIsModalOpen(true)}
          >
            {task.coverImage && (
              <div className="w-full h-32 overflow-hidden rounded-t-lg">
                <img
                  src={task.coverImage}
                  alt="Task cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4">
              {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {task.labels.map((label) => (
                    <Badge
                      key={label.id}
                      className="text-xs px-2 py-0.5"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              )}

              <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">
                {task.title}
              </h4>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-3">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{format(new Date(task.dueDate), 'dd MMM', { locale: ptBR })}</span>
                    </div>
                  )}

                  {task.activities.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{task.activities.length}</span>
                    </div>
                  )}

                  {task.attachments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip size={12} />
                      <span>{task.attachments.length}</span>
                    </div>
                  )}

                  {totalChecklist > 0 && (
                    <div className="flex items-center gap-1">
                      <CheckSquare size={12} />
                      <span>{completedChecklist}/{totalChecklist}</span>
                    </div>
                  )}
                </div>
              </div>

              {task.members.length > 0 && (
                <div className="flex items-center justify-end gap-1">
                  {task.members.slice(0, 3).map((member) => (
                    <Avatar key={member.id} className="w-6 h-6">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                      +{task.members.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      <TaskModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
