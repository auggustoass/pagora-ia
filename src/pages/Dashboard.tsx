
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/components/dashboard/Dashboard';

const DashboardPage = () => {
  return (
    <Layout>
      <div className="w-full">
        <Dashboard />
      </div>
    </Layout>
  );
};

export default DashboardPage;
