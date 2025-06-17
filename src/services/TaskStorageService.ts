
import { supabase } from '@/integrations/supabase/client';

export class TaskStorageService {
  private static BUCKET_NAME = 'task-covers';

  static async uploadCoverImage(file: File, taskId: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${taskId}_${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      console.log('Upload successful, URL:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading cover image:', error);
      throw error;
    }
  }

  static async deleteCoverImage(imageUrl: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Extrair o path da URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      console.log('Deleting file:', filePath);

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting cover image:', error);
      throw error;
    }
  }

  static convertBase64ToFile(base64String: string, fileName: string): File {
    // Remove o prefixo data:image/...;base64,
    const base64Data = base64String.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const mimeType = base64String.split(',')[0].split(':')[1].split(';')[0];
    
    return new File([byteArray], fileName, { type: mimeType });
  }
}
