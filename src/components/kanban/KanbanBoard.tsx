
import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { KanbanColumn } from './KanbanColumn';
import { useTask } from './TaskContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function KanbanBoard() {
  const { columns, moveTask } = useTask();

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">Quadro Principal</h2>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#1a1a1a] border-gray-700 text-gray-300 hover:bg-[#2a2a2a]"
          >
            <Plus size={16} className="mr-2" />
            Adicionar Tarefa
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {Object.values(columns).map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col h-full ${
                    snapshot.isDraggingOver ? 'bg-gray-800/50 rounded-lg' : ''
                  }`}
                >
                  <KanbanColumn
                    column={column}
                    isDraggingOver={snapshot.isDraggingOver}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
