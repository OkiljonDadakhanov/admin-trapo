import { OrdersTable } from "@/components/admin/orders-table"

export default function OrdersPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage and track all customer orders.</p>
      </div>

      <OrdersTable />
    </div>
  )
}
