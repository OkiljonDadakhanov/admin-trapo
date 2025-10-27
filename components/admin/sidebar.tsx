"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { logoutAdmin } from "@/lib/admin-auth"
import { BarChart3, Package, Settings, LogOut } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    logoutAdmin()
    router.push("/login")
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-foreground">Trapo</h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive("/admin")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/admin/orders"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive("/admin/orders")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Orders</span>
        </Link>

        <Link
          href="/admin/products"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive("/admin/products")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Package className="w-5 h-5" />
          <span>Products</span>
        </Link>

        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive("/admin/settings")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
