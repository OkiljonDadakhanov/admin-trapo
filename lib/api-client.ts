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

    // Add token to headers if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
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
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Orders
  async getAllOrders(): Promise<Order[]> {
    return this.request<Order[]>("/api/orders")
  }

  // Admin: Get all orders (for admin panel)
  async getAllOrdersAdmin(): Promise<Order[]> {
    return this.request<Order[]>("/api/orders")
  }

  async getOrderById(id: string): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}`)
  }

  async updateOrderStatus(
    id: string,
    status: "ordered" | "shipped" | "completed",
    note?: string
  ): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note }),
    })
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return this.request<Product[]>("/api/products")
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

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/api/health")
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
