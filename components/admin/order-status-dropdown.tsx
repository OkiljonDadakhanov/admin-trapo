"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import type { Order } from "@/lib/api-client"

interface OrderStatusDropdownProps {
  order: Order
  onStatusChange: (orderId: string, status: "ordered" | "shipped" | "completed", note?: string) => void
}

export function OrderStatusDropdown({ order, onStatusChange }: OrderStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const statuses: Array<"ordered" | "shipped" | "completed"> = ["ordered", "shipped", "completed"]

  const handleStatusChange = async (newStatus: "ordered" | "shipped" | "completed") => {
    setIsUpdating(true)
    try {
      const note = `Status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`
      await onStatusChange(order._id, newStatus, note)
      setIsOpen(false)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-2"
      >
        Update Status
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-10">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating || order.status === status}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                order.status === status ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
