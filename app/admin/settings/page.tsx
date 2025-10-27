"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your admin panel settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Backend API URL</label>
              <Input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:5000"
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Make sure your Express backend is running on this URL
              </p>
            </div>

            <Button onClick={handleSave} className="w-full">
              Save Settings
            </Button>

            {isSaved && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <p className="text-sm text-emerald-600">Settings saved successfully</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Admin Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Admin Username</label>
              <Input type="text" value="akilhan13" disabled className="bg-muted" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <Input type="text" value="Administrator" disabled className="bg-muted" />
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-600">You have full access to all admin features</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Start Guide</h3>
        <div className="space-y-3 text-sm text-foreground">
          <p>
            <strong>1. Dashboard:</strong> View real-time sales metrics, revenue, and order statistics
          </p>
          <p>
            <strong>2. Orders:</strong> Track all customer orders, filter by status (Pending, Shipped, Completed), and
            update order status manually
          </p>
          <p>
            <strong>3. Products:</strong> Add, edit, and remove products from your inventory
          </p>
          <p>
            <strong>Order Status Flow:</strong> Pending → Shipped → Completed
          </p>
          <p className="text-muted-foreground mt-4">
            The dashboard automatically refreshes every 20-60 seconds to show the latest data from your backend.
          </p>
        </div>
      </Card>
    </div>
  )
}
