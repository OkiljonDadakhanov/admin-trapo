"use client"

import { useAuth as useAuthContext } from '@/contexts/auth-context'

export function useAuth() {
  return useAuthContext()
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
  }
}

export function useAdminAuth() {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  
  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated && isAdmin,
    isAdmin,
    logout,
  }
}
