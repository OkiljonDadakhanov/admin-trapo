"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { adminAPI, AdminUser } from '@/lib/admin-api'
import { useCustomToast } from '@/components/custom-toast'

interface AuthContextType {
  user: AdminUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const toast = useCustomToast()

  const isAuthenticated = !!user && !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('adminToken')
        if (storedToken) {
          setToken(storedToken)
          // Verify token by fetching admin data
          const adminData = await adminAPI.getCurrentAdmin()
          setUser(adminData)
        }
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('adminToken')
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await adminAPI.loginAdmin(email, password)
      
      setToken(response.adminToken)
      setUser(response.admin)
      localStorage.setItem('adminToken', response.adminToken)
      // Also set cookie for middleware-based protection
      try {
        const maxAgeSeconds = 60 * 60 * 24 * 7 // 7 days
        document.cookie = `adminToken=${response.adminToken}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax` + (location.protocol === 'https:' ? '; Secure' : '')
      } catch {}
      
      toast.success('Admin Login Successful', `Welcome back, ${response.admin.name}!`)
      return true
    } catch (error: any) {
      toast.error('Login Error', error.message || 'Invalid admin credentials')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('adminToken')
    adminAPI.logoutAdmin()
    // Clear cookie
    try {
      document.cookie = `adminToken=; Path=/; Max-Age=0; SameSite=Lax` + (location.protocol === 'https:' ? '; Secure' : '')
    } catch {}
    toast.success('Logged Out', 'You have been successfully logged out')
    router.push('/login')
  }

  const refreshUser = async () => {
    try {
      if (token) {
        const adminData = await adminAPI.getCurrentAdmin()
        setUser(adminData)
      }
    } catch (error) {
      // Token is invalid, logout user
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
