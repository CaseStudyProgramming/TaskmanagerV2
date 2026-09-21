export interface RequestInterceptor {
  (request: RequestInit): RequestInit | Promise<RequestInit>;
}

export interface ResponseInterceptor {
  (response: Response): Response | Promise<Response>;
}

class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  async applyRequestInterceptors(request: RequestInit): Promise<RequestInit> {
    let modifiedRequest = request;
    for (const interceptor of this.requestInterceptors) {
      modifiedRequest = await interceptor(modifiedRequest);
    }
    return modifiedRequest;
  }

  async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }
}

export const interceptorManager = new InterceptorManager();

// Add default request interceptor to add auth token
interceptorManager.addRequestInterceptor(async (request) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    request.headers = {
      ...request.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return request;
});

// Add default response interceptor to handle errors
interceptorManager.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // Handle unauthorized - clear token and redirect to login
    localStorage.removeItem('auth_token');
    window.location.href = '/auth/login';
  }
  return response;
});
