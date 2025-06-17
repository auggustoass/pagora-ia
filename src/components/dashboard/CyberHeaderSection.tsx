
import React from 'react';
import { CyberSearchBar } from './CyberSearchBar';
import { CyberActionButtons } from './CyberActionButtons';

interface CyberHeaderSectionProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onQuickInvoiceSuccess: () => void;
}

export function CyberHeaderSection({ 
  searchTerm, 
  onSearchTermChange, 
  onQuickInvoiceSuccess 
}: CyberHeaderSectionProps) {
  return (
    <div className="relative">
      {/* Cyber grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50"></div>
      
      <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 py-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {/* Holographic accent */}
            <div className="w-1 h-16 bg-gradient-to-b from-green-400 via-green-500 to-transparent rounded-full animate-pulse"></div>
            
            <div>
              <h1 className="text-4xl font-mono font-bold text-white tracking-wider relative">
                CYBER_DASHBOARD
                
                {/* Text glow effect */}
                <div className="absolute inset-0 text-4xl font-mono font-bold text-green-400 opacity-30 blur-sm animate-pulse">
                  CYBER_DASHBOARD
                </div>
                
                {/* Underline effect */}
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 via-transparent to-green-400 animate-pulse"></div>
              </h1>
              
              <p className="text-sm font-mono text-gray-400 tracking-widest uppercase mt-2">
                // FINANCIAL_CONTROL_SYSTEM_V2.0
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <CyberSearchBar 
            value={searchTerm} 
            onChange={onSearchTermChange} 
            placeholder="// SEARCH_DATABASE..." 
          />
          <CyberActionButtons onQuickInvoiceSuccess={onQuickInvoiceSuccess} />
        </div>
      </div>
      
      {/* Bottom scan line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
    </div>
  );
}
