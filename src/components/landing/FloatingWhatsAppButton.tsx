
import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5511998115159"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1ebf5b] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
      aria-label="Converse com nosso suporte via WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
};
