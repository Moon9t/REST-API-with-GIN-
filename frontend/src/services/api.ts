import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: number;
  user_id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  created_at?: string;
  updated_at?: string;
}

export interface Attendee {
  id: number;
  event_id: number;
  user_id: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string, confirm: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, confirm, name });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    return response.data;
  },

  me: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getAll: async (page: number = 1, limit: number = 10, search?: string) => {
    const params: any = { page, limit };
    if (search) params.search = search;
    const response = await api.get<PaginatedResponse<Event>>('/events', { params });
    return response.data;
  },

  getById: async (id: number | string) => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  create: async (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<Event>('/events', event);
    return response.data;
  },

  update: async (id: number, event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await api.put<Event>(`/events/${id}`, event);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  
  // Get events the user is attending. Returns an object with `data: Event[]` so callers
  // can use the same shape as `getAll` (i.e. `attending.data`). If userId is falsy,
  // return an empty list.
  getAttending: async (userId?: number | null) => {
    if (!userId) {
      return { data: [] as Event[] };
    }
    const response = await api.get<Event[]>(`/attendees/${userId}/events`);
    return { data: response.data };
  },
};

// Attendees API
export const attendeesAPI = {
  getEventAttendees: async (eventId: number) => {
    const response = await api.get<User[]>(`/events/${eventId}/attendees`);
    return response.data;
  },

  addAttendee: async (eventId: number, userId: number) => {
    const response = await api.post(`/events/${eventId}/attendees?user_id=${userId}`);
    return response.data;
  },

  removeAttendee: async (eventId: number, userId: number) => {
    const response = await api.delete(`/events/${eventId}/attendees/${userId}`);
    return response.data;
  },

  getUserEvents: async (userId: number) => {
    const response = await api.get<Event[]>(`/attendees/${userId}/events`);
    return response.data;
  },

  // legacy: use eventsAPI.getAttending which returns { data: Event[] }
};

export default api;
