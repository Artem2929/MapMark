// Profile CRUD Endpoints
const API_BASE = 'http://localhost:3000/api/user';

// GET - Read profile data
export const getProfile = async (userId) => {
  const response = await fetch(`${API_BASE}/${userId}`);
  return response.json();
};

// POST - Create new profile
export const createProfile = async (profileData) => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

// PUT - Update profile
export const updateProfile = async (userId, profileData) => {
  const response = await fetch(`${API_BASE}/${userId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  return response.json();
};

// DELETE - Delete profile
export const deleteProfile = async (userId) => {
  const response = await fetch(`${API_BASE}/${userId}`, {
    method: 'DELETE'
  });
  return response.json();
};

// PUT - Update avatar
export const updateAvatar = async (userId, avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  
  const response = await fetch(`http://localhost:3000/api/avatar/${userId}`, {
    method: 'PUT',
    body: formData
  });
  return response.json();
};

// PATCH - Update online status
export const updateOnlineStatus = async (userId, isOnline) => {
  const response = await fetch(`${API_BASE}/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isOnline })
  });
  return response.json();
};