
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Upload, 
  X, 
  Check 
} from 'lucide-react';

interface CoverImageUploadProps {
  currentImage?: string;
  onImageSelect: (imageUrl: string) => void;
  onImageRemove: () => void;
}

const COVER_TEMPLATES = [
  {
    id: 'tech-1',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop',
    name: 'Tecnologia'
  },
  {
    id: 'design-1',
    url: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=200&fit=crop',
    name: 'Design'
  },
  {
    id: 'code-1',
    url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
    name: 'Programação'
  },
  {
    id: 'meeting-1',
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop',
    name: 'Reunião'
  },
  {
    id: 'analytics-1',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop',
    name: 'Analytics'
  },
  {
    id: 'workspace-1',
    url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=200&fit=crop',
    name: 'Workspace'
  }
];

export function CoverImageUpload({ currentImage, onImageSelect, onImageRemove }: CoverImageUploadProps) {
  const [customUrl, setCustomUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = (templateUrl: string, templateId: string) => {
    setSelectedTemplate(templateId);
    onImageSelect(templateUrl);
  };

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      onImageSelect(customUrl.trim());
      setCustomUrl('');
      setSelectedTemplate(null);
    }
  };

  const handleRemoveImage = () => {
    onImageRemove();
    setSelectedTemplate(null);
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

      {/* Templates */}
      <div>
        <h5 className="text-xs font-medium text-gray-400 mb-2">Templates Sugeridos</h5>
        <div className="grid grid-cols-2 gap-2">
          {COVER_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className={`relative cursor-pointer rounded border-2 transition-all ${
                selectedTemplate === template.id || currentImage === template.url
                  ? 'border-blue-500 ring-1 ring-blue-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => handleTemplateSelect(template.url, template.id)}
            >
              <img
                src={template.url}
                alt={template.name}
                className="w-full h-16 object-cover rounded"
              />
              <div className="absolute bottom-1 left-1">
                <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                  {template.name}
                </Badge>
              </div>
              {(selectedTemplate === template.id || currentImage === template.url) && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* URL personalizada */}
      <div>
        <h5 className="text-xs font-medium text-gray-400 mb-2">URL Personalizada</h5>
        <div className="flex gap-2">
          <Input
            placeholder="Cole a URL da imagem..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="bg-[#2a2a2a] border-gray-700 text-white text-sm"
          />
          <Button
            size="sm"
            onClick={handleCustomUrlSubmit}
            disabled={!customUrl.trim()}
          >
            <Upload size={14} />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Recomendamos proporção 2:1 (ex: 400x200px)
        </p>
      </div>
    </div>
  );
}
