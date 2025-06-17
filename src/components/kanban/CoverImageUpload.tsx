
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Upload, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react';

interface CoverImageUploadProps {
  currentImage?: string;
  onImageSelect: (imageUrl: string) => void;
  onImageRemove: () => void;
}

export function CoverImageUpload({ currentImage, onImageSelect, onImageRemove }: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result);
        setUploading(false);
      };
      reader.onerror = () => {
        setError('Erro ao processar o arquivo.');
        setUploading(false);
      };
      reader.readAsDataURL(file);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem.');
      setUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const handleRemoveImage = () => {
    onImageRemove();
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Image size={16} />
          Imagem de Capa
        </h4>
        {currentImage && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemoveImage}
            className="text-red-400 hover:text-red-300"
          >
            <X size={14} className="mr-1" />
            Remover
          </Button>
        )}
      </div>

      {/* Preview atual */}
      {currentImage && (
        <div className="relative">
          <img
            src={currentImage}
            alt="Capa atual"
            className="w-full h-24 object-cover rounded border border-gray-700"
          />
          <Badge className="absolute top-2 right-2 bg-green-600 text-xs">
            <Check size={12} className="mr-1" />
            Ativa
          </Badge>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload section */}
      <div>
        <h5 className="text-xs font-medium text-gray-400 mb-2">Upload de Arquivo</h5>
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="cover-upload"
            disabled={uploading}
          />
          <label
            htmlFor="cover-upload"
            className={`cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                ) : (
                  <Upload size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-300 font-medium">
                  {uploading ? 'Processando...' : 'Clique para selecionar uma imagem'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP até 5MB
                </p>
                <p className="text-xs text-gray-500">
                  Recomendado: 370x112px (proporção 2:1)
                </p>
              </div>
            </div>
          </label>
        </div>

        {!currentImage && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 bg-[#2a2a2a] border-gray-700"
            onClick={() => document.getElementById('cover-upload')?.click()}
            disabled={uploading}
          >
            <Upload size={14} className="mr-2" />
            {uploading ? 'Processando...' : 'Escolher Arquivo'}
          </Button>
        )}
      </div>
    </div>
  );
}
