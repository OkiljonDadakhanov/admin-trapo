// Admin API client for admin-specific endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface AdminUser {
  _id: string
  name: string
  email: string
  role: 'admin' | 'super_admin'
  createdAt: string
  updatedAt: string
}

export interface AdminAuthResponse {
  adminToken: string
  admin: AdminUser
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

class AdminAPI {
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

  // Admin Authentication endpoints
  async registerAdmin(name: string, email: string, password: string): Promise<AdminAuthResponse> {
    return this.request<AdminAuthResponse>("/api/admin/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  async loginAdmin(email: string, password: string): Promise<AdminAuthResponse> {
    return this.request<AdminAuthResponse>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async getCurrentAdmin(): Promise<AdminUser> {
    return this.request<AdminUser>("/api/admin/profile")
  }

  // Admin Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/api/admin/dashboard")
  }

  // Admin Orders endpoints
  async getAllOrders(): Promise<Order[]> {
    return this.request<Order[]>("/api/admin/orders")
  }

  async getOrderById(id: string): Promise<Order> {
    return this.request<Order>(`/api/admin/orders/${id}`)
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

  // Admin Users endpoints
  async getAllUsers(): Promise<AdminUser[]> {
    return this.request<AdminUser[]>("/api/admin/users")
  }

  async getUserById(id: string): Promise<AdminUser> {
    return this.request<AdminUser>(`/api/admin/users/${id}`)
  }

  // Logout
  async logoutAdmin(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken")
    }
  }
}

export const adminAPI = new AdminAPI(API_BASE_URL)
