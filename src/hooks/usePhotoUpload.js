import { useState, useCallback } from 'react';
import { apiPost } from '../utils/apiUtils';

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadPhoto = useCallback(async (file, description, userId) => {
    if (!file) throw new Error('No file provided');

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Розмір файлу не повинен перевищувати 5MB');
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('Можна завантажувати тільки зображення');
    }

    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('description', description);
      formData.append('userId', userId);
      
      const response = await apiPost('/photos/upload', formData);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Помилка при додаванні фото');
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  return { uploadPhoto, uploading, error };
};