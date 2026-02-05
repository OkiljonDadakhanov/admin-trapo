"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, X } from "lucide-react"
import { apiClient, type Product } from "@/lib/api-client"

interface ProductFormProps {
  product?: Product | null
  onSuccess: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditMode = !!product

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    colors: "",
    sizes: "",
    inStock: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        image: product.image || "",
        colors: product.colors?.join(", ") || "",
        sizes: product.sizes?.join(", ") || "",
        inStock: product.inStock,
      })
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsLoading(true)
      const colors = formData.colors
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
      const sizes = formData.sizes
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        stock: Number.parseInt(formData.stock),
        image: formData.image || undefined,
        colors,
        sizes,
        inStock: formData.inStock,
      }

      if (isEditMode && product) {
        await apiClient.updateProduct(product._id, productData)
      } else {
        await apiClient.createProduct(productData)
      }
      onSuccess()
    } catch (err) {
      setError(isEditMode ? "Failed to update product" : "Failed to create product")
      console.error("Error saving product:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-muted/50 relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h3>

        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
            <Input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Stickers, Prints"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Price *</label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Stock *</label>
            <Input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Image URL</label>
          <Input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">Optional: Enter product image URL</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Colors</label>
            <Input
              type="text"
              name="colors"
              value={formData.colors}
              onChange={handleChange}
              placeholder="e.g., Red, Blue, Green (comma-separated)"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">Separate colors with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Sizes</label>
            <Input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleChange}
              placeholder="e.g., S, M, L, XL (comma-separated)"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">Separate sizes with commas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="inStock"
            id="inStock"
            checked={formData.inStock}
            onChange={handleChange}
            disabled={isLoading}
            className="w-4 h-4 rounded border-input"
          />
          <label htmlFor="inStock" className="text-sm font-medium text-foreground">
            Product is in stock
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
