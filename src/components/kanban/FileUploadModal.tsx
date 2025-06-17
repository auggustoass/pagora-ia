
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTask, Attachment } from './TaskContext';
import { Paperclip, Upload, File, Image, Link as LinkIcon, X } from 'lucide-react';

interface FileUploadModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ taskId, isOpen, onClose }: FileUploadModalProps) {
  const { addAttachment } = useTask();
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Para demonstração, criamos uma URL local (blob)
        // Em produção, você enviaria para um serviço como Supabase Storage
        const fileUrl = URL.createObjectURL(file);
        
        const attachment: Omit<Attachment, 'id' | 'uploadedAt'> = {
          name: file.name,
          url: fileUrl,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          size: file.size,
          uploadedBy: 'current-user'
        };

        addAttachment(taskId, attachment);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    const attachment: Omit<Attachment, 'id' | 'uploadedAt'> = {
      name: linkName.trim() || linkUrl,
      url: linkUrl.trim(),
      type: 'link',
      uploadedBy: 'current-user'
    };

    addAttachment(taskId, attachment);
    setLinkUrl('');
    setLinkName('');
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1a1a1a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Paperclip size={20} />
            Adicionar Anexo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Upload size={16} />
              Enviar Arquivo
            </h4>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              />
              
              <div className="space-y-2">
                <div className="flex justify-center">
                  <File size={32} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">
                  Clique para selecionar arquivos ou arraste aqui
                </p>
                <p className="text-xs text-gray-500">
                  Máximo 10MB por arquivo
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Enviando...' : 'Selecionar Arquivos'}
              </Button>
            </div>
          </div>

          {/* Link */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <LinkIcon size={16} />
              Adicionar Link
            </h4>
            
            <Input
              placeholder="URL do link..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="bg-[#2a2a2a] border-gray-700 text-white"
            />
            
            <Input
              placeholder="Nome do link (opcional)..."
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              className="bg-[#2a2a2a] border-gray-700 text-white"
            />
            
            <Button
              onClick={handleAddLink}
              disabled={!linkUrl.trim()}
              className="w-full"
            >
              Adicionar Link
            </Button>
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
