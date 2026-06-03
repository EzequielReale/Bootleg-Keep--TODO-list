import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = async (email, password, rememberMe) => {
  const response = await api.post('/auth/login', { email, password, rememberMe });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Notes
export const getNotes = async (status, categoryId, search) => {
  const params = {};
  if (status) params.status = status;
  if (categoryId) params.category = categoryId;
  if (search) params.search = search;
  const response = await api.get('/notes', { params });
  return response.data;
};

export const createNote = async (data) => {
  const response = await api.post('/notes', data);
  return response.data;
};

export const updateNote = async (id, data) => {
  const response = await api.patch(`/notes/${id}`, data);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

export const addCategoryToNote = async (noteId, categoryId) => {
  const response = await api.post(`/notes/${noteId}/categories/${categoryId}`);
  return response.data;
};

export const removeCategoryFromNote = async (noteId, categoryId) => {
  const response = await api.delete(`/notes/${noteId}/categories/${categoryId}`);
  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.patch(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
