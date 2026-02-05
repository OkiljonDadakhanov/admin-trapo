// API client for authentication
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

class AuthAPI {
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
      // Handle authentication errors
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("token")
        }
        throw new Error("Authentication failed. Please log in again.")
      }
      
      // Handle other errors
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(error.message || `API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/api/users/profile")
  }

  async updateProfile(name: string, email: string): Promise<User> {
    return this.request<User>("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify({ name, email }),
    })
  }

  async getUserStats(): Promise<any> {
    return this.request<any>("/api/users/stats")
  }

  async updateUserStats(action: string, value?: number): Promise<any> {
    return this.request<any>("/api/users/stats", {
      method: "PUT",
      body: JSON.stringify({ action, value }),
    })
  }

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }
}

export const authAPI = new AuthAPI(API_BASE_URL)

