// API client for communicating with Express backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface User {
  _id: string
  name: string
  email: string
  role?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Order {
  _id: string
  userId: string
  orderNumber: string
  items: Array<{
    type: string
    productId?: string
    customId?: string
    quantity: number
    price: number
    customizations?: Record<string, unknown>
  }>
  customerInfo: {
    name: string
    email: string
    phone?: string
    address?: string
  }
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: "ordered" | "shipped" | "completed"
  statusHistory?: Array<{
    status: string
    note?: string
    updatedAt: Date | string
  }>
  createdAt: string
  updatedAt: string
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  stock: number
  colors: string[]
  sizes: string[]
  inStock: boolean
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  recentOrders: Order[]
  monthlyRevenue: Array<{
    month: string
    revenue: number
  }>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Add admin token to headers if available
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("adminToken")
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`
      }
    }

    // Merge with existing headers
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminToken")
        }
        throw new Error("Admin authentication failed. Please log in again.")
      }
      
      // Handle other errors
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Admin Orders
  async getAllOrders(params?: PaginationParams): Promise<Order[]> {
    const queryString = this.buildQueryString(params)
    return this.request<Order[]>(`/api/admin/orders${queryString}`)
  }

  async getOrdersPaginated(params?: PaginationParams): Promise<PaginatedResponse<Order>> {
    const queryString = this.buildQueryString({ ...params, paginated: true })
    return this.request<PaginatedResponse<Order>>(`/api/admin/orders${queryString}`)
  }

  async getOrderById(id: string): Promise<Order> {
    return this.request<Order>(`/api/admin/orders/${id}`)
  }

  private buildQueryString(params?: Record<string, unknown>): string {
    if (!params) return ""
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value))
      }
    })
    const query = searchParams.toString()
    return query ? `?${query}` : ""
  }

  async updateOrderStatus(
    id: string,
    status: "ordered" | "shipped" | "completed",
    note?: string
  ): Promise<Order> {
    return this.request<Order>(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note }),
    })
  }

  // Products
  async getAllProducts(params?: PaginationParams): Promise<Product[]> {
    const queryString = this.buildQueryString(params)
    return this.request<Product[]>(`/api/products${queryString}`)
  }

  async getProductsPaginated(params?: PaginationParams): Promise<PaginatedResponse<Product>> {
    const queryString = this.buildQueryString({ ...params, paginated: true })
    return this.request<PaginatedResponse<Product>>(`/api/products${queryString}`)
  }

  async getProductById(id: string): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`)
  }

  async createProduct(
    product: Omit<Product, "_id" | "createdAt" | "updatedAt"> & { 
      colors?: string[]; 
      sizes?: string[]; 
      inStock?: boolean;
      image?: string;
    }
  ): Promise<Product> {
    return this.request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  }

  async updateProduct(
    id: string,
    product: Partial<Omit<Product, "_id" | "createdAt" | "updatedAt">>,
  ): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request<void>(`/api/products/${id}`, {
      method: "DELETE",
    })
  }

  // Admin Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/api/admin/dashboard")
  }

  // Admin Users
  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/api/admin/users")
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/api/health")
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
