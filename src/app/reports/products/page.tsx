'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Package, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductBarChart, CategoryPieChart } from '@/components/reports/SalesChart'
import { DateRangeSelector } from '@/components/reports/DateRangeSelector'
import { ReportTable, productPerformanceColumns, categoryPerformanceColumns } from '@/components/reports/ReportTable'
import { ExportControls } from '@/components/reports/ExportControls'
import {
  calculateProductPerformance,
  calculateCategoryPerformance,
  filterOrders,
  getDateRange,
  formatCurrency
} from '@/lib/reportUtils'
import { generateProductReportPDF } from '@/lib/pdfExport'
import { ReportPeriod, Order, Product } from '@/types'
import Link from 'next/link'

export default function ProductsReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month')
  const [customDateRange, setCustomDateRange] = useState<{ startDate: Date; endDate: Date }>()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
        ])
        const [ordersData, productsData] = await Promise.all([
          ordersRes.json(),
          productsRes.json(),
        ])
        if (active) {
          setOrders(ordersData as any)
          setProducts(productsData as any)
        }
      } catch (error) {
        console.error('Failed to fetch reports data:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const dateRange = selectedPeriod === 'custom' && customDateRange
      ? customDateRange
      : getDateRange(selectedPeriod)
    
    const filtered = filterOrders(orders, { dateRange })
    setFilteredOrders(filtered)
  }, [orders, selectedPeriod, customDateRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading products report...</div>
      </div>
    )
  }

  const productPerformance = calculateProductPerformance(filteredOrders)
  const categoryPerformance = calculateCategoryPerformance(filteredOrders)
  
  // Calculate low stock items
  const lowStockItems = products.filter(product => product.stock < 20)
  
  // Calculate top performers
  const topProducts = productPerformance.slice(0, 10)
  const topCategories = categoryPerformance.slice(0, 5)
  
  // Calculate total items sold
  const totalItemsSold = productPerformance.reduce((sum, product) => sum + product.quantitySold, 0)
  const totalRevenue = productPerformance.reduce((sum, product) => sum + product.revenue, 0)

  const handleExportPDF = async () => {
    const dateRangeText = selectedPeriod === 'custom' && customDateRange
      ? `${customDateRange.startDate.toLocaleDateString()} - ${customDateRange.endDate.toLocaleDateString()}`
      : `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report`
    
    await generateProductReportPDF(
      'Product Performance Report',
      dateRangeText,
      productPerformance,
      categoryPerformance,
      lowStockItems
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/reports">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Reports</h1>
                <p className="text-gray-600 mt-1">Product performance and inventory insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Date Range Selector */}
        <DateRangeSelector
          selectedPeriod={selectedPeriod}
          customDateRange={customDateRange}
          onPeriodChange={setSelectedPeriod}
          onCustomDateChange={setCustomDateRange}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">{totalItemsSold.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Product Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductBarChart 
            data={topProducts} 
            title="Top 10 Products by Revenue"
          />
          <CategoryPieChart 
            data={categoryPerformance} 
            title="Revenue by Category"
          />
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Low Stock Alert</h3>
            </div>
            <p className="text-red-700 mb-4">
              The following products have low stock levels (less than 20 units):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <Badge variant="destructive">{product.stock} left</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{product.category.name}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Product Performance Table */}
        <ReportTable
          data={productPerformance}
          columns={productPerformanceColumns}
          title="Product Performance Analysis"
          searchPlaceholder="Search products..."
        />

        {/* Category Performance Table */}
        <ReportTable
          data={categoryPerformance}
          columns={categoryPerformanceColumns}
          title="Category Performance Analysis"
          searchPlaceholder="Search categories..."
          pageSize={5}
        />

        {/* Top Performers Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Best Selling Products</h3>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      <p className="text-sm text-gray-600">{product.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{product.quantitySold} sold</p>
                    <p className="text-sm text-gray-600">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Category Leaders</h3>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={category.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.categoryName}</p>
                      <p className="text-sm text-gray-600">{category.productCount} products</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(category.totalRevenue)}</p>
                    <p className="text-sm text-gray-600">{category.totalQuantity} items</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Export Controls */}
        <ExportControls
          data={productPerformance}
          filename="products_report"
          title="Products Report"
          onExportPDF={handleExportPDF}
        />
      </div>
    </div>
  )
}