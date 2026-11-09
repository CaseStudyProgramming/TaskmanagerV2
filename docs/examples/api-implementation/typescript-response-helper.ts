export interface ResponseStatus {
  code: number;
  message: string;
  is_success: boolean;
}

export interface ResponseMeta {
  timestamp: number;
  request_id: string;
  pagination?: PaginationMeta;
  errors?: ErrorDetail[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface StandardResponse<T = any> {
  status: ResponseStatus;
  data: T | null;
  meta: ResponseMeta;
}

export function extractData<T>(response: StandardResponse<T>): T {
  if (!response.status.is_success) {
    throw new Error(response.status.message);
  }
  return response.data as T;
}

export function extractError(response: StandardResponse): ErrorDetail[] {
  return response.meta.errors || [];
}

export function isSuccess(response: StandardResponse): boolean {
  return response.status.is_success;
}
