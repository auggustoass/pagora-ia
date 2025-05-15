
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ApiEndpointTester } from '@/components/admin/ApiEndpointTester';

export default function ApiTester() {
  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Teste de Endpoints API</h1>
        <ApiEndpointTester />
      </div>
    </Layout>
  );
}
