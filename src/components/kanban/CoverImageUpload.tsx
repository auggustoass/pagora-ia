
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Link, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TaskStorageService } from '@/services/TaskStorageService';
import { useToast } from '@/hooks/use-toast';

interface CoverImageUploadProps {
  currentImage?: string;
  onImageSelect: (imageUrl: string) => void;
  onImageRemove: () => void;
}

export function CoverImageUpload({ currentImage, onImageSelect, onImageRemove }: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo e tamanho do arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo de imagem.',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      // Se já existe uma imagem, remove ela primeiro
      if (currentImage && currentImage.includes('supabase')) {
        await TaskStorageService.deleteCoverImage(currentImage);
      }

      const imageUrl = await TaskStorageService.uploadCoverImage(file, `temp_${Date.now()}`);
      onImageSelect(imageUrl);
      
      toast({
        title: 'Sucesso',
        description: 'Imagem carregada com sucesso!'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer upload da imagem.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    // Validação básica de URL de imagem
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = urlInput.toLowerCase();
    
    const isValidImageUrl = (
      urlInput.startsWith('http') && 
      (
        imageExtensions.some(ext => lowerUrl.includes(ext)) ||
        lowerUrl.includes('unsplash.com') ||
        lowerUrl.includes('images.') ||
        lowerUrl.includes('imgur.com') ||
        lowerUrl.includes('cloudinary.com') ||
        lowerUrl.includes('amazonaws.com') ||
        lowerUrl.includes('supabase')
      )
    );

    if (!isValidImageUrl) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma URL válida de imagem.',
        variant: 'destructive'
      });
      return;
    }

    onImageSelect(urlInput);
    setUrlInput('');
    setShowUrlInput(false);

    toast({
      title: 'Sucesso',
      description: 'Imagem adicionada com sucesso!'
    });
  };

  const handleRemoveImage = async () => {
    try {
      // Se a imagem está no Supabase Storage, remove ela
      if (currentImage && currentImage.includes('supabase')) {
        await TaskStorageService.deleteCoverImage(currentImage);
      }
      
      onImageRemove();
      
      toast({
        title: 'Sucesso',
        description: 'Imagem removida com sucesso!'
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a imagem.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
          <Image size={16} />
          Imagem de Capa
        </label>

        {currentImage && (
          <div className="mb-4 relative group">
            <img
              src={currentImage}
              alt="Cover preview"
              className="w-full h-32 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveImage}
            >
              <X size={14} />
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <Upload size={14} />
            {uploading ? 'Carregando...' : 'Upload'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-2"
          >
            <Link size={14} />
            URL
          </Button>

          {currentImage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <X size={14} />
              Remover
            </Button>
          )}
        </div>

        {showUrlInput && (
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="https://exemplo.com/imagem.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
            />
            <Button type="button" size="sm" onClick={handleUrlSubmit}>
              Adicionar
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
