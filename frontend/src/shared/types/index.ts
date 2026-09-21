// Common types used across the application

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}
