
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { DocsNavigation } from '@/components/docs/DocsNavigation';
import { DocsContent } from '@/components/docs/DocsContent';
import { DocsSearch } from '@/components/docs/DocsSearch';
import { Card } from '@/components/ui/card';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Documentação do Sistema</h1>
          <p className="text-muted-foreground">
            Guia completo de como usar todas as funcionalidades da plataforma HBLACKPIX
          </p>
        </div>

        <DocsSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <DocsNavigation 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                searchQuery={searchQuery}
              />
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <DocsContent 
              activeSection={activeSection} 
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Docs;
