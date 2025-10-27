"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { apiClient, type Order } from "@/lib/api-client"

const statusColors = {
  ordered: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // Try admin endpoint first, fallback to regular endpoint
        let data
        try {
          data = await apiClient.getAllOrdersAdmin()
        } catch {
          // Fallback to regular endpoint if admin endpoint doesn't exist
          data = await apiClient.getAllOrders()
        }
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setOrders(sorted.slice(0, 5))
      } catch (err) {
        setError("Failed to load recent orders")
        console.error("Error fetching orders:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()

    const interval = setInterval(fetchOrders, 20000)
    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Recent Orders</h2>
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{order.customerInfo.name}</p>
                <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">${order.total.toFixed(2)}</p>
                <Badge className={`text-xs mt-1 ${statusColors[order.status as keyof typeof statusColors]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-8">No orders yet</p>
        )}
      </div>
    </Card>
  )
}
