"use client"

import { useRouter } from "next/navigation"
import { getAdminUsername, logoutAdmin } from "@/lib/admin-auth"
import { Bell, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function AdminHeader() {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    setUsername(getAdminUsername())
  }, [])

  const handleLogout = () => {
    logoutAdmin()
    router.push("/login")
  }

  return (
    <header className="bg-background border-b border-border px-8 py-4 flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">Welcome back, {username || "Admin"}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{username || "Admin"}</span>
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
