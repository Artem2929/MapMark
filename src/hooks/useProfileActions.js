import { useState, useCallback } from 'react';
import { apiPut } from '../utils/apiUtils';

export const useProfileActions = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (userId, profileData) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await apiPut(`/user/${userId}/profile`, profileData);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Помилка при оновленні профілю');
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateAvatar = useCallback(async (userId, formData) => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await apiPut(`/user/${userId}/avatar`, formData);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Помилка при завантаженні аватара');
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { updateProfile, updateAvatar, saving, error };
};