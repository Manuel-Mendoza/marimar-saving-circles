const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Include auth token if available
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: { correoElectronico: string; password: string }) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      this.token = response.data.token;
    }

    return response;
  }

  async register(formData: FormData) {
    const response = await this.request<{
      user: any;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: formData,
      headers: {
        // No incluir Content-Type para que el navegador lo setee automáticamente con boundary
      },
    });

    // Store token
    if (response.success && response.data?.token) {
      localStorage.setItem('auth_token', response.data.token);
      this.token = response.data.token;
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    // Clear token
    localStorage.removeItem('auth_token');
    this.token = null;

    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  // User management endpoints (Admin only)
  async getAllUsers() {
    return this.request<{ users: any[] }>('/users');
  }

  async getPendingUsers() {
    return this.request<{ users: any[] }>('/users/pending');
  }

  async approveUser(userId: number) {
    return this.request<{ user: any }>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'approve' }),
    });
  }

  async rejectUser(userId: number, reason?: string) {
    return this.request<{ user: any }>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'reject', reason }),
    });
  }

  async suspendUser(userId: number) {
    return this.request<{ user: any }>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'suspend' }),
    });
  }

  async reactivateUser(userId: number) {
    return this.request<{ user: any }>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'reactivate' }),
    });
  }

  async deleteUser(userId: number, reason?: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  // Products endpoints
  async getProducts() {
    return this.request<{ products: any[] }>('/products');
  }

  async getProduct(productId: number) {
    return this.request<{ product: any }>(`/products/${productId}`);
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: number, productData: any) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: number) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
