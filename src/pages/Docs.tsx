
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DocsContent } from '@/components/docs/DocsContent';
import { DocsSearch } from '@/components/docs/DocsSearch';

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto">
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
    </Layout>
  );
};

export default Docs;
