
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CyberSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CyberSearchBar({ value, onChange, placeholder = "// SEARCH..." }: CyberSearchBarProps) {
  return (
    <div className="relative max-w-md group">
      {/* Hexagonal border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-transparent to-green-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Search className="h-4 w-4 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
        </div>
        
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 bg-black border border-green-500/30 text-white placeholder-gray-500 focus:border-green-400/60 focus:ring-green-400/20 rounded-lg font-mono text-sm h-12 transition-all duration-300 hover:border-green-400/40 hover:shadow-lg hover:shadow-green-400/10"
        />
        
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/0 via-green-400/5 to-green-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-green-400/50"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-green-400/50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-green-400/50"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-green-400/50"></div>
    </div>
  );
}
