const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getMediaUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
    return filePath;
  }
  
  // Extraire l'hôte de l'API (ex: https://resoc.onrender.com)
  const host = API_BASE.includes('http') ? API_BASE.replace(/\/api\/?$/, '') : '';
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  return `${host}${cleanPath}`;
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...getAuthHeader(),
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (!isFormData && options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Erreur serveur (${response.status})`);
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  getMe: () => request('/auth/me'),
  updateProfile: (formData) => request('/auth/profile', { method: 'PUT', body: formData }),
  changePassword: (oldPassword, newPassword) => request('/auth/change-password', { method: 'PUT', body: { old_password: oldPassword, new_password: newPassword } }),

  // Posts
  getPosts: (page = 1) => request(`/posts?page=${page}`),
  createPost: (formData) => request('/posts', { method: 'POST', body: formData }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  toggleReaction: (postId, reactionType = 'like') => request(`/posts/${postId}/reactions`, { method: 'POST', body: { reaction_type: reactionType } }),
  getComments: (postId) => request(`/posts/${postId}/comments`),
  addComment: (postId, content) => request(`/posts/${postId}/comments`, { method: 'POST', body: { content } }),
  deleteComment: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),

  // Events
  getEvents: () => request('/events'),
  createEvent: (formData) => request('/events', { method: 'POST', body: formData }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  rsvpEvent: (id, status) => request(`/events/${id}/rsvp`, { method: 'POST', body: { status } }),

  // Directory & Profiles
  getDirectory: () => request('/users'),
  getUserProfile: (username) => request(`/users/${username}`),

  // Admin
  getAdminUsers: () => request('/admin/users'),
  createAdminUser: (userData) => request('/admin/users', { method: 'POST', body: userData }),
  updateAdminUser: (id, userData) => request(`/admin/users/${id}`, { method: 'PUT', body: userData }),
  toggleUserStatus: (id) => request(`/admin/users/${id}/toggle-status`, { method: 'PUT' }),
  resetUserPassword: (id, newPassword) => request(`/admin/users/${id}/reset-password`, { method: 'PUT', body: { new_password: newPassword } }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};
