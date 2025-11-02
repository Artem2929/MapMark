import { API_ENDPOINTS } from '../constants';

export const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem('accessToken');
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const config = {
    credentials: 'include',
    ...options,
    headers: {
      ...getAuthHeaders(isFormData),
      ...options.headers
    }
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
};

export const apiGet = (endpoint) => 
  makeAuthenticatedRequest(`${API_ENDPOINTS.BASE_URL}${endpoint}`);

export const apiPost = (endpoint, data) => {
  const isFormData = data instanceof FormData;
  return makeAuthenticatedRequest(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' }
  });
};

export const apiPut = (endpoint, data) => {
  const isFormData = data instanceof FormData;
  return makeAuthenticatedRequest(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
    method: 'PUT',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' }
  });
};

export const apiDelete = (endpoint) => 
  makeAuthenticatedRequest(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
    method: 'DELETE'
  });