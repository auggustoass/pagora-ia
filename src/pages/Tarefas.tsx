
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { SupabaseTaskProvider } from '@/components/kanban/SupabaseTaskProvider';

const Tarefas = () => {
  return (
    <SupabaseTaskProvider>
      <Layout>
        <div className="min-h-screen bg-kanban-bg">
          <div className="p-6">
            <div className="mb-6">
              {/* Header content can be added here */}
            </div>
            <KanbanBoard />
          </div>
        </div>
      </Layout>
    </SupabaseTaskProvider>
  );
};

export default Tarefas;
