import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ChatAssistant } from '@/components/chat/ChatAssistant';
const Index = () => {
  return <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 ">
        <div className="lg:col-span-2">
          <Dashboard />
        </div>
        <div className="h-[calc(100vh-9rem)]">
          <ChatAssistant />
        </div>
      </div>
    </Layout>;
};
export default Index;