const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const updateAvatar = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};

export const updateProfile = async (userId, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};