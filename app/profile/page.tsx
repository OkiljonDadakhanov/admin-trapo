"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import type { User } from "@/lib/api"
import { useCustomToast } from "@/components/custom-toast"
import { User as UserIcon, LogOut, Mail } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const toast = useCustomToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        // Get user profile from the correct endpoint
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
      } catch (error: any) {
        toast.error("Authentication Error", error.message || "Please login again")
        localStorage.removeItem("token")
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router, toast])

  const handleLogout = () => {
    localStorage.removeItem("token")
    toast.success("Logged Out", "You have been successfully logged out")
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="glass rounded-lg p-8">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center">
              <UserIcon size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Profile</h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {user.role && (
              <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Go to Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

