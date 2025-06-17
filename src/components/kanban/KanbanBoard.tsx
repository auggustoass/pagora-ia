import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { KanbanColumn } from './KanbanColumn';
import { useTask } from './TaskContext';
import { CreateTaskModal } from './CreateTaskModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
export function KanbanBoard() {
  const {
    columns,
    moveTask,
    loading
  } = useTask();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const handleDragEnd = (result: DropResult) => {
    const {
      destination,
      source,
      draggableId
    } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    moveTask(draggableId, source.droppableId, destination.droppableId, destination.index);
  };
  if (loading) {
    return <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
          <span>Carregando tarefas...</span>
        </div>
      </div>;
  }
  return <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          
          <Button variant="outline" size="sm" className="bg-kanban-card border-border text-foreground hover:bg-muted" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Adicionar Tarefa
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {Object.values(columns).map(column => <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} className={`flex flex-col h-full ${snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg' : ''}`}>
                  <KanbanColumn column={column} isDraggingOver={snapshot.isDraggingOver} />
                  {provided.placeholder}
                </div>}
            </Droppable>)}
        </div>
      </DragDropContext>

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>;
}