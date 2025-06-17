
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskProvider } from '@/components/kanban/TaskContext';

const Tarefas = () => {
  return (
    <TaskProvider>
      <Layout>
        <div className="min-h-screen bg-[#0a0a0a]">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Quadro de Tarefas</h1>
              <p className="text-gray-400">Gerencie suas tarefas de forma visual e intuitiva</p>
            </div>
            <KanbanBoard />
          </div>
        </div>
      </Layout>
    </TaskProvider>
  );
};

export default Tarefas;
