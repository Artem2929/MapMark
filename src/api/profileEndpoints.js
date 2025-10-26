const API_BASE_URL = 'http://localhost:3000/api';

export const updateAvatar = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
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
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
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