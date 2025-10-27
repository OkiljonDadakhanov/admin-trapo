"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { apiClient, type Order } from "@/lib/api-client"

interface ChartData {
  date: string
  sales: number
  orders: number
}

export function SalesChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAndProcessOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const orders = await apiClient.getAllOrders()

        const dailyData: Record<string, { sales: number; orders: number }> = {}

        orders.forEach((order: Order) => {
          const date = new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })

          if (!dailyData[date]) {
            dailyData[date] = { sales: 0, orders: 0 }
          }

          dailyData[date].sales += order.payment.total
          dailyData[date].orders += 1
        })

        const data = Object.entries(dailyData)
          .map(([date, { sales, orders }]) => ({
            date,
            sales: Math.round(sales * 100) / 100,
            orders,
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7) // Last 7 days

        setChartData(data.length > 0 ? data : [])
      } catch (err) {
        setError("Failed to load sales data")
        console.error("Error fetching sales data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndProcessOrders()

    const interval = setInterval(fetchAndProcessOrders, 60000)
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
      <h2 className="text-lg font-semibold text-foreground mb-6">Sales Overview</h2>
      {isLoading ? (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        </div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: `1px solid var(--color-border)`,
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--color-foreground)" }}
            />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2} />
            <Line type="monotone" dataKey="orders" stroke="var(--color-chart-2)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-80">
          <p className="text-muted-foreground">No sales data available yet</p>
        </div>
      )}
    </Card>
  )
}
