"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trash2, Edit2, AlertCircle, RefreshCw } from "lucide-react"
import { apiClient, type Product, type PaginatedResponse } from "@/lib/api-client"
import { useDebounce } from "@/hooks/use-debounce"
import { Pagination } from "./pagination"
import { ProductForm } from "./product-form"

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isPaginated, setIsPaginated] = useState(false)

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 300)

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try paginated endpoint first
      try {
        const response: PaginatedResponse<Product> = await apiClient.getProductsPaginated({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch || undefined,
        })
        setProducts(response.data)
        setTotalItems(response.pagination.total)
        setTotalPages(response.pagination.totalPages)
        setIsPaginated(true)
      } catch {
        // Fallback to non-paginated endpoint
        const data = await apiClient.getAllProducts()
        // Client-side filtering and pagination
        let filtered = data
        if (debouncedSearch) {
          filtered = data.filter(
            (product) =>
              product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              product.category.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        }
        setTotalItems(filtered.length)
        setTotalPages(Math.ceil(filtered.length / itemsPerPage))
        const start = (currentPage - 1) * itemsPerPage
        setProducts(filtered.slice(start, start + itemsPerPage))
        setIsPaginated(false)
      }
    } catch (err) {
      setError("Failed to load products")
      console.error("Error fetching products:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, debouncedSearch])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts, refreshTrigger])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      setDeletingId(id)
      await apiClient.deleteProduct(id)
      onProductUpdated()
      fetchProducts()
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Failed to delete product")
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleEditSuccess = () => {
    setEditingProduct(null)
    onProductUpdated()
    fetchProducts()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
    setCurrentPage(1)
  }

  if (editingProduct) {
    return (
      <ProductForm
        product={editingProduct}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingProduct(null)}
      />
    )
  }

  if (isLoading && products.length === 0) {
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

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProducts()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
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
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-foreground">{product.name}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{product.category}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-foreground">${product.price.toFixed(2)}</td>
                    <td className="py-4 px-4 text-sm text-foreground">
                      <span className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                        {product.stock}
                        {product.stock <= 5 && " (Low)"}
                      </span>
                    </td>
                    <td className="py-4 px-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-700"
                      >
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
