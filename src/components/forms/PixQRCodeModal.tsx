
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, MessageCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PixQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixCode: string;
  whatsappNumber: string;
  onNewInvoice: () => void;
}

export function PixQRCodeModal({ 
  isOpen, 
  onClose, 
  pixCode, 
  whatsappNumber, 
  onNewInvoice 
}: PixQRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && pixCode) {
      generateQRCode();
    }
  }, [isOpen, pixCode]);

  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true);
      const url = await QRCode.toDataURL(pixCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar a imagem do QR Code.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência."
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código PIX.",
        variant: "destructive"
      });
    }
  };

  const openWhatsApp = () => {
    if (whatsappNumber) {
      const whatsapp = whatsappNumber.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Olá! Sua cobrança PIX está pronta. Você pode pagar escaneando o QR Code ou copiando o código PIX: ${pixCode}`
      );
      window.open(`https://wa.me/55${whatsapp}?text=${message}`, '_blank');
    }
  };

  const handleNewInvoice = () => {
    onNewInvoice();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-pagora-dark border-white/10">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-green-400">
            PIX Gerado com Sucesso!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              {isGeneratingQR ? (
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code PIX" 
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-gray-500">
                  Erro ao gerar QR Code
                </div>
              )}
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Escaneie o QR Code acima com o app do seu banco
            </p>
          </div>

          {/* Código PIX */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Ou copie o código PIX:
            </p>
            <div className="flex items-center gap-2">
              <Input 
                value={pixCode} 
                readOnly 
                className="bg-white/5 border-white/10 text-xs font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={openWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar via WhatsApp
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleNewInvoice}
                className="flex-1"
              >
                Nova Cobrança
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
