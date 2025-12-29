import type {
  User,
  Grupo,
  UserGroup,
  Producto,
  Contribution,
  Delivery,
  PaymentRequest,
  ProductSelection,
  GroupAdminDetails,
  PaymentOption,
  MobilePaymentData,
  BankPaymentData,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
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
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const maxRetries = 3;

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
        // Handle rate limiting with exponential backoff
        if (response.status === 429 && retryCount < maxRetries) {
          const backoffDelay = Math.min(2000 * Math.pow(2.5, retryCount), 30000); // Max 30 seconds, starting at 2s
          console.warn(
            `Rate limited, retrying in ${backoffDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`
          );
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.request<T>(endpoint, options, retryCount + 1);
        }

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
      user: User;
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
      user: User;
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
    return this.request<{ user: User }>('/auth/me');
  }

  // User management endpoints (Admin only)
  async getAllUsers() {
    return this.request<{ users: User[] }>('/users');
  }

  async getPendingUsers() {
    return this.request<{ users: User[] }>('/users/pending');
  }

  async approveUser(userId: number) {
    return this.request<{ user: User }>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'approve' }),
    });
  }

  async rejectUser(userId: number, reason?: string) {
    return this.request<{ user: User }>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'reject', reason }),
    });
  }

  async suspendUser(userId: number) {
    return this.request<{ user: User }>(`/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'suspend' }),
    });
  }

  async reactivateUser(userId: number) {
    return this.request<{ user: User }>(`/users/${userId}/status`, {
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

  async updateProfile(
    userId: number,
    profileData: {
      nombre?: string;
      apellido?: string;
      telefono?: string;
      direccion?: string;
      correoElectronico?: string;
      imagenPerfil?: string;
    }
  ) {
    return this.request<{ user: User }>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async joinGroup(productId: number, currency: 'VES' | 'USD') {
    return this.request<{
      groupId: number;
      position: number;
      currency: string;
      monthlyPayment: number;
    }>('/users/join', {
      method: 'POST',
      body: JSON.stringify({ productId, currency }),
    });
  }

  // User data endpoints
  async getMyGroups() {
    return this.request<{ userGroups: UserGroup[] }>('/users/me/groups');
  }

  async getMyContributions() {
    return this.request<{ contributions: Contribution[] }>('/users/me/contributions');
  }

  async getMyDeliveries() {
    return this.request<{ deliveries: Delivery[] }>('/users/me/deliveries');
  }

  // Products endpoints
  async getProducts() {
    return this.request<{ products: Producto[] }>('/products');
  }

  async getProduct(productId: number) {
    return this.request<{ product: Producto }>(`/products/${productId}`);
  }

  async createProduct(productData: Partial<Producto>) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: number, productData: Partial<Producto>) {
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

  async selectProduct(productId: number) {
    return this.request<{
      groupId: number;
      groupName: string;
      position: number;
      productName: string;
      participantsNeeded: number;
      currentParticipants: number;
      groupStarted: boolean;
    }>(`/products/${productId}/select`, {
      method: 'POST',
    });
  }

  // Groups endpoints
  async getGroups() {
    return this.request<{ groups: Grupo[] }>('/groups');
  }

  async getGroup(groupId: number) {
    return this.request<{ group: Grupo }>(`/groups/${groupId}`);
  }

  async joinGroupById(groupId: number) {
    return this.request<{
      groupId: number;
      position: number;
    }>(`/groups/${groupId}/join`, {
      method: 'POST',
    });
  }

  async startDraw(groupId: number) {
    return this.request<{
      groupId: number;
      finalPositions: { position: number; userId: number; name: string }[];
      animationSequence: { position: number; userId: number; name: string; delay?: number }[];
    }>(`/groups/${groupId}/start-draw`, {
      method: 'POST',
    });
  }

  async getGroupAdminDetails(groupId: number) {
    return this.request<GroupAdminDetails>(`/groups/${groupId}/admin`);
  }

  async createGroup(groupData: { nombre: string; duracionMeses: number }) {
    return this.request<{ group: Grupo }>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(
    groupId: number,
    groupData: { nombre?: string; duracionMeses?: number; estado?: string }
  ) {
    return this.request<{ group: Grupo }>(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  }

  async deleteGroup(groupId: number) {
    return this.request(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  // Payment Requests
  async uploadReceipt(file: File) {
    const formData = new FormData();
    formData.append('receipt', file);

    return this.request<{
      url: string;
    }>('/payment-requests/upload-receipt', {
      method: 'POST',
      body: formData,
      headers: {
        // No incluir Content-Type para que el navegador lo setee automáticamente con boundary
      },
    });
  }

  async createPaymentRequest(data: {
    groupId: number;
    periodo: string;
    monto: number;
    moneda: 'VES' | 'USD';
    metodoPago: string;
    referenciaPago?: string;
    comprobantePago?: string;
  }) {
    return this.request<{
      request: PaymentRequest;
    }>('/payment-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyPaymentRequests() {
    return this.request<{
      requests: PaymentRequest[];
    }>('/payment-requests/my-requests');
  }

  async getAllPaymentRequests() {
    return this.request<{
      requests: PaymentRequest[];
    }>('/payment-requests');
  }

  async approvePaymentRequest(requestId: number, notasAdmin?: string) {
    return this.request<{
      request: PaymentRequest;
    }>(`/payment-requests/${requestId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ notasAdmin }),
    });
  }

  async rejectPaymentRequest(requestId: number, notasAdmin: string) {
    return this.request<{
      request: PaymentRequest;
    }>(`/payment-requests/${requestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ notasAdmin }),
    });
  }

  // Payment Options
  async getPaymentOptions() {
    return this.request<{
      options: PaymentOption[];
    }>('/payment-options');
  }

  async getAllPaymentOptions() {
    return this.request<{
      options: PaymentOption[];
    }>('/payment-options/admin');
  }

  async getPaymentOptionByType(tipo: 'movil' | 'banco') {
    return this.request<{
      option: PaymentOption | null;
    }>(`/payment-options/${tipo}`);
  }

  async savePaymentOption(tipo: 'movil' | 'banco', detalles: MobilePaymentData | BankPaymentData) {
    return this.request<{
      option: PaymentOption;
    }>(`/payment-options/${tipo}`, {
      method: 'PUT',
      body: JSON.stringify({ detalles }),
    });
  }

  async togglePaymentOption(optionId: number) {
    return this.request<{
      option: PaymentOption;
    }>(`/payment-options/${optionId}/toggle`, {
      method: 'PUT',
    });
  }

  async deletePaymentOption(optionId: number) {
    return this.request(`/payment-options/${optionId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminDashboardStats() {
    return this.request<{
      stats: {
        totalUsers: number;
        activeUsers: number;
        pendingApprovals: number;
        totalProducts: number;
        activeProducts: number;
        totalGroups: number;
        activeGroups: number;
        totalPayments: number;
        pendingPayments: number;
        monthlyRevenue: number;
      };
    }>('/admin/dashboard-stats');
  }

  async getAdminDashboardCharts() {
    return this.request<{
      revenueData: Array<{ mes: string; ingresos: number }>;
      userGroupData: Array<{ mes: string; usuarios: number; grupos: number }>;
    }>('/admin/dashboard-charts');
  }

  async getAllRatings() {
    return this.request<{
      ratings: Array<{
        id: number;
        raterId: number;
        ratedId: number;
        groupId?: number;
        ratingType: string;
        rating: number;
        comment?: string;
        createdAt: string;
        rater: {
          nombre: string;
          apellido: string;
        };
        rated: {
          nombre: string;
          apellido: string;
        };
        group?: {
          nombre: string;
        };
      }>;
      stats: {
        totalUsers: number;
        averageReputation: number;
        excellentUsers: number;
        reliableUsers: number;
        acceptableUsers: number;
        underObservationUsers: number;
        totalRatings: number;
      };
    }>('/admin/ratings');
  }

  // Ratings endpoints
  async getUserReputation(userId: number) {
    return this.request<{
      reputation: {
        score: number;
        status: string;
        totalRatings: number;
        paymentReliability: number;
        deliveryReliability: number;
        lastUpdate: string;
        user: {
          id: number;
          nombre: string;
          apellido: string;
        };
      };
    }>(`/ratings/users/${userId}/reputation`);
  }

  async getUserRatings(userId: number) {
    return this.request<{
      ratings: Array<{
        id: number;
        raterId: number;
        ratingType: string;
        rating: number;
        comment?: string;
        createdAt: string;
        rater: {
          nombre: string;
          apellido: string;
        };
      }>;
    }>(`/ratings/users/${userId}/ratings`);
  }

  async createRating(
    userId: number,
    ratingData: {
      ratedId: number;
      groupId?: number;
      ratingType: 'PAYMENT' | 'DELIVERY' | 'COMMUNICATION';
      rating: number;
      comment?: string;
    }
  ) {
    return this.request<{
      rating: {
        id: number;
        raterId: number;
        ratedId: number;
        groupId?: number;
        ratingType: string;
        rating: number;
        comment?: string;
        createdAt: string;
      };
    }>(`/ratings/users/${userId}/rate`, {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  async deleteRating(ratingId: number) {
    return this.request(`/ratings/ratings/${ratingId}`, {
      method: 'DELETE',
    });
  }

  // Group management admin endpoints
  async advanceGroupMonth(groupId: number, deliveryNotes?: string) {
    return this.request<{
      groupId: number;
      previousTurn: number;
      newTurn: number;
      completed: boolean;
      deliveryCreated: boolean;
    }>(`/admin/groups/${groupId}/advance-month`, {
      method: 'POST',
      body: JSON.stringify({ deliveryNotes }),
    });
  }

  async completeDelivery(deliveryId: number, notas?: string) {
    return this.request<{
      delivery: Delivery;
    }>(`/admin/deliveries/${deliveryId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ notas }),
    });
  }

  async updateDeliveryStatus(
    deliveryId: number,
    estado: 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO',
    notas?: string
  ) {
    return this.request<{
      delivery: Delivery;
    }>(`/admin/deliveries/${deliveryId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ estado, notas }),
    });
  }

  async autoAdvanceMonth() {
    return this.request<{
      processedGroups: number;
      advancedGroups: number;
      currentPeriod: string;
    }>(`/admin/groups/auto-advance-month`, {
      method: 'POST',
    });
  }

  async runAutoAdvance() {
    return this.request<{
      processedGroups: number;
      advancedGroups: number;
      currentPeriod: string;
    }>(`/admin/groups/auto-advance-month`, {
      method: 'POST',
    });
  }

  async regenerateContributions() {
    return this.request<{
      groupsProcessed: number;
      contributionsCreated: number;
    }>(`/admin/groups/regenerate-contributions`, {
      method: 'POST',
    });
  }

  async updateDeliveryAddress(deliveryId: number, direccion: string) {
    return this.request<{
      delivery: Delivery;
    }>(`/users/me/deliveries/${deliveryId}/address`, {
      method: 'PUT',
      body: JSON.stringify({ direccion }),
    });
  }

  async createCurrentUserDelivery(groupId: number) {
    return this.request<{
      delivery: Delivery;
    }>(`/users/me/deliveries/create-current`, {
      method: 'POST',
      body: JSON.stringify({ groupId }),
    });
  }

  async getDeliveriesDashboard() {
    return this.request<{
      stats: {
        totalDeliveries: number;
        pendingDeliveries: number;
        completedDeliveries: number;
        monthlyDeliveries: number;
        completionRate: number;
      };
      deliveriesByStatus: Record<string, number>;
      recentDeliveries: Array<{
        id: number;
        productName: string;
        productValue: string;
        fechaEntrega: string;
        mesEntrega: string;
        estado: string;
        direccion?: string;
        user: { nombre: string; apellido: string };
        group: { nombre: string };
      }>;
      deliveriesByGroup: Array<{
        groupId: number;
        groupName: string;
        totalDeliveries: number;
        pendingDeliveries: number;
        completedDeliveries: number;
      }>;
    }>('/admin/deliveries-dashboard');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
