"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, Loader2, Eye, EyeOff, UserPlus } from "lucide-react"
import { adminAPI } from "@/lib/admin-api"
import { useCustomToast } from "@/components/custom-toast"
import { useAuth } from "@/hooks/use-auth"

export default function AdminRegisterPage() {
  const router = useRouter()
  const toast = useCustomToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/admin')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const response = await adminAPI.registerAdmin(
        formData.name,
        formData.email,
        formData.password
      )
      
      // Store admin token
      localStorage.setItem('adminToken', response.adminToken)
      // Also set cookie for middleware-based protection
      try {
        const maxAgeSeconds = 60 * 60 * 24 * 7 // 7 days
        document.cookie = `adminToken=${response.adminToken}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax` + (location.protocol === 'https:' ? '; Secure' : '')
      } catch {}
      
      toast.success('Admin Registration Successful', `Welcome, ${response.admin.name}!`)
      router.push('/admin')
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-white" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-slate-800 border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Admin Account</h1>
          <p className="text-slate-400">Set up your admin account for the first time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <Input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              "Create Admin Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-2">Already have an admin account?</p>
          <Button
            variant="link"
            onClick={() => router.push('/login')}
            className="text-xs text-purple-400 hover:text-purple-300 p-0 h-auto"
          >
            Sign In Instead
          </Button>
        </div>
      </Card>
    </div>
  )
}
