"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, ShoppingCart, DollarSign, Users, AlertCircle } from "lucide-react"
import { apiClient, type Order } from "@/lib/api-client"

export function DashboardOverview() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await apiClient.getAllOrders()
        setOrders(data)
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error("Error fetching orders:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()

    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  const totalRevenue = orders.reduce((sum, order) => sum + order.payment.total, 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const completedOrders = orders.filter((o) => o.status === "completed").length
  const uniqueCustomers = new Set(orders.map((o) => o.userId)).size

  const metrics = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: `${pendingOrders} pending`,
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      change: `${completedOrders} completed`,
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      label: "Customers",
      value: uniqueCustomers.toString(),
      change: "+5.1%",
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      change: "Awaiting shipment",
      icon: TrendingUp,
      color: "text-orange-500",
    },
  ]

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{isLoading ? "..." : metric.value}</p>
                <p className="text-xs text-emerald-600 mt-2">{metric.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-muted ${metric.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
