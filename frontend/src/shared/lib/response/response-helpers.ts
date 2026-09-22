export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || 'Request failed');
  }
  return response.data;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
    };
  }
  return {
    success: false,
    message: 'An unexpected error occurred',
  };
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function createErrorResponse(message: string, errors?: string[]): ApiError {
  return {
    success: false,
    message,
    errors,
  };
}
