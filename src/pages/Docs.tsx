
import React, { useState } from 'react';
import { DocsContent } from '@/components/docs/DocsContent';
import { DocsSearch } from '@/components/docs/DocsSearch';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isLoading } = useAuth();

  if (!user && !isLoading) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-6xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Documentação do Sistema</h1>
          <p className="text-muted-foreground">
            Guia completo de como usar todas as funcionalidades da plataforma HBLACKPIX
          </p>
        </div>

        <div className="mb-6">
          <DocsSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <DocsContent searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default Docs;
