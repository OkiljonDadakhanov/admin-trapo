"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trash2, Edit2, AlertCircle } from "lucide-react"
import { apiClient, type Product } from "@/lib/api-client"

interface ProductsTableProps {
  refreshTrigger: number
  onProductUpdated: () => void
}

export function ProductsTable({ refreshTrigger, onProductUpdated }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await apiClient.getAllProducts()
        setProducts(data)
      } catch (err) {
        setError("Failed to load products")
        console.error("Error fetching products:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [refreshTrigger])

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [products, searchTerm])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      setDeletingId(id)
      await apiClient.deleteProduct(id)
      setProducts(products.filter((p) => p._id !== id))
      onProductUpdated()
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Failed to delete product")
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading products...</p>
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

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-foreground">{product.name}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{product.category}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-foreground">${product.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-sm text-foreground">{product.stock}</td>
                    <td className="py-4 px-4 flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>
    </Card>
  )
}
