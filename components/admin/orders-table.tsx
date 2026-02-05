"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle, RefreshCw } from "lucide-react"
import { apiClient, type Order, type PaginatedResponse } from "@/lib/api-client"
import { OrderStatusDropdown } from "./order-status-dropdown"
import { useDebounce } from "@/hooks/use-debounce"
import { Pagination } from "./pagination"

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isPaginated, setIsPaginated] = useState(false)

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 300)

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try paginated endpoint first
      try {
        const response: PaginatedResponse<Order> = await apiClient.getOrdersPaginated({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch || undefined,
          status: selectedStatus || undefined,
        })
        setOrders(response.data)
        setTotalItems(response.pagination.total)
        setTotalPages(response.pagination.totalPages)
        setIsPaginated(true)
      } catch {
        // Fallback to non-paginated endpoint
        const data = await apiClient.getAllOrders()
        // Client-side filtering and pagination
        let filtered = data
        if (debouncedSearch) {
          filtered = filtered.filter(
            (order) =>
              order.orderNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              order.customerInfo.name.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        }
        if (selectedStatus) {
          filtered = filtered.filter((order) => order.status === selectedStatus)
        }
        setTotalItems(filtered.length)
        setTotalPages(Math.ceil(filtered.length / itemsPerPage))
        const start = (currentPage - 1) * itemsPerPage
        setOrders(filtered.slice(start, start + itemsPerPage))
        setIsPaginated(false)
      }
    } catch (err) {
      setError("Failed to load orders. Make sure the backend is running.")
      console.error("Error fetching orders:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, debouncedSearch, selectedStatus])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Reset to page 1 when search or status filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, selectedStatus])

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
    setCurrentPage(1)
  }

  if (isLoading && orders.length === 0) {
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOrders()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
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
              {orders.length > 0 ? (
                orders.map((order) => (
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </Card>
  )
}
