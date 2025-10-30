export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  created_at?: string;
}

export interface Event {
  id: number;
  user_id: number;
  name: string;
  description: string;
  location: string;
  date_time: string;
  created_at?: string;
  updated_at?: string;
}

export interface Attendee {
  id: number;
  event_id: number;
  user_id: number;
  status: AttendeeStatus;
  created_at: string;
  updated_at: string;
}

export type AttendeeStatus = 'pending' | 'confirmed' | 'cancelled';

export interface CreateEventDTO {
  name: string;
  description: string;
  location: string;
  date_time: string;
}

export interface UpdateEventDTO extends Partial<Event> {}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}