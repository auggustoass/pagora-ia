
import React from 'react';
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-green-500/30 rounded-lg p-4 shadow-xl z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm mb-1">
            Instalar App
          </h3>
          <p className="text-gray-300 text-xs mb-3">
            Instale o app para acesso rápido e funcionalidades offline
          </p>
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white w-full"
          >
            <Download className="w-3 h-3 mr-2" />
            Instalar
          </Button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
