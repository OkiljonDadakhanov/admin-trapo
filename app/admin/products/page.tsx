"use client"

import { useState } from "react"
import { ProductsTable } from "@/components/admin/products-table"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleProductAdded = () => {
    setShowForm(false)
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product inventory</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <ProductForm
          product={null}
          onSuccess={handleProductAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      <ProductsTable
        refreshTrigger={refreshTrigger}
        onProductUpdated={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  )
}
