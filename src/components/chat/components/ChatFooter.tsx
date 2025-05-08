
import React from 'react';
import { CreditsDisplay } from '@/components/dashboard/CreditsDisplay';
import { QuickActions } from './QuickActions';
import { ChatInput } from './ChatInput';
import { useAuth } from '@/components/auth/AuthProvider';

interface ChatFooterProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e?: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function ChatFooter({ input, setInput, sendMessage, isLoading, inputRef }: ChatFooterProps) {
  const { user } = useAuth();
  
  return (
    <div className="p-2 md:p-4 border-t border-white/10">
      {user && (
        <div className="md:hidden mb-2">
          <CreditsDisplay showAlert={false} className="text-xs" />
        </div>
      )}
      
      <QuickActions setInput={setInput} inputRef={inputRef} />
      <ChatInput 
        input={input} 
        setInput={setInput} 
        sendMessage={sendMessage} 
        isLoading={isLoading} 
        inputRef={inputRef}
      />
    </div>
  );
}
