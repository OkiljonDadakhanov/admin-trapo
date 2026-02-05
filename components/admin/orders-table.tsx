"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle } from "lucide-react"
import { apiClient, type Order } from "@/lib/api-client"
import { OrderStatusDropdown } from "./order-status-dropdown"

const statusColors = {
  ordered: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
}

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
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
        setError("Failed to load orders. Make sure the backend is running.")
        console.error("Error fetching orders:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !selectedStatus || order.status === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, selectedStatus])

  const handleStatusChange = async (orderId: string, newStatus: "ordered" | "shipped" | "completed", note?: string) => {
    try {
      const updatedOrder = await apiClient.updateOrderStatus(orderId, newStatus, note)
      setOrders(orders.map((o) => (o._id === orderId ? updatedOrder : o)))
      setError(null)
    } catch (err) {
      console.error("Error updating order status:", err)
      setError("Failed to update order status")
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6">
        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              onClick={() => setSelectedStatus(null)}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedStatus === "ordered" ? "default" : "outline"}
              onClick={() => setSelectedStatus("ordered")}
              size="sm"
            >
              Ordered
            </Button>
            <Button
              variant={selectedStatus === "shipped" ? "default" : "outline"}
              onClick={() => setSelectedStatus("shipped")}
              size="sm"
            >
              Shipped
            </Button>
            <Button
              variant={selectedStatus === "completed" ? "default" : "outline"}
              onClick={() => setSelectedStatus("completed")}
              size="sm"
            >
              Completed
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-foreground">{order.orderNumber}</td>
                    <td className="py-4 px-4 text-sm text-foreground">{order.customerInfo.name}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-foreground">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`text-xs ${statusColors[order.status as keyof typeof statusColors]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <OrderStatusDropdown order={order} onStatusChange={handleStatusChange} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
        </div>
      </div>
    </Card>
  )
}
