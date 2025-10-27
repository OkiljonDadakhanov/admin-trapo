"use client"

import { Bell, User } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8">
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
        </button>

        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <User className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </header>
  )
}
