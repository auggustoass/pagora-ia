
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { RequireAuth } from '@/components/auth/RequireAuth';

const Admin = () => {
  return (
    <RequireAuth requireAdmin={true}>
      <Layout>
        <AdminDashboard />
      </Layout>
    </RequireAuth>
  );
};

export default Admin;
