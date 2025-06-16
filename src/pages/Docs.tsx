
import React, { useState } from 'react';
import { DocsNavigation } from '@/components/docs/DocsNavigation';
import { DocsMainContent } from '@/components/docs/DocsMainContent';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('inicio');
  const { user, isLoading } = useAuth();

  if (!user && !isLoading) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex">
        <DocsNavigation 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        <DocsMainContent activeSection={activeSection} />
      </div>
    </div>
  );
};

export default Docs;
