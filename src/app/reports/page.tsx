'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Package, CreditCard, Calendar, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuickStats } from '@/components/reports/MetricsCard'
import { DailySalesChart, CategoryPieChart } from '@/components/reports/SalesChart'
import { DateRangeSelector } from '@/components/reports/DateRangeSelector'
import { ReportTable, productPerformanceColumns } from '@/components/reports/ReportTable'
import { ExportControls } from '@/components/reports/ExportControls'
import { 
  calculateSalesMetrics, 
  generateDailySalesData, 
  calculateProductPerformance,
  calculateCategoryPerformance,
  filterOrders,
  getDateRange
} from '@/lib/reportUtils'
import { ReportPeriod, Order } from '@/types'
import Link from 'next/link'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('week')
  const [customDateRange, setCustomDateRange] = useState<{ startDate: Date; endDate: Date }>()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/orders')
        const data = await res.json()
        if (active) {
          setOrders(data as any)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
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
        <div className="text-lg">Loading reports...</div>
      </div>
    )
  }

  const currentMetrics = calculateSalesMetrics(filteredOrders)
  const dailySalesData = generateDailySalesData(
    filteredOrders, 
    selectedPeriod === 'custom' && customDateRange 
      ? customDateRange 
      : getDateRange(selectedPeriod)
  )
  const productPerformance = calculateProductPerformance(filteredOrders).slice(0, 5)
  const categoryPerformance = calculateCategoryPerformance(filteredOrders)

  // Calculate quick stats for different periods
  const todayOrders = filterOrders(orders, { dateRange: getDateRange('day') })
  const weekOrders = filterOrders(orders, { dateRange: getDateRange('week') })
  const monthOrders = filterOrders(orders, { dateRange: getDateRange('month') })
  
  const todaySales = calculateSalesMetrics(todayOrders).totalSales
  const weekSales = calculateSalesMetrics(weekOrders).totalSales
  const monthSales = calculateSalesMetrics(monthOrders).totalSales

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
              <p className="text-gray-600 mt-1">Analyze your business performance and trends</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                Back to POS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <QuickStats
          todaySales={todaySales}
          yesterdaySales={0} // Would calculate from previous day
          weekSales={weekSales}
          lastWeekSales={0} // Would calculate from previous week
          monthSales={monthSales}
          lastMonthSales={0} // Would calculate from previous month
          totalOrders={orders.length}
        />

        {/* Date Range Selector */}
        <DateRangeSelector
          selectedPeriod={selectedPeriod}
          customDateRange={customDateRange}
          onPeriodChange={setSelectedPeriod}
          onCustomDateChange={setCustomDateRange}
        />

        {/* Report Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/reports/sales">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Sales Reports</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Daily, weekly, and monthly sales analysis with trends and comparisons
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link href="/reports/products">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Product Reports</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Best-selling products, category performance, and inventory insights
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </Link>

          <Link href="/reports/transactions">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Transaction Reports</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Payment methods, peak hours, and transaction patterns analysis
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailySalesChart 
            data={dailySalesData} 
            title={`Sales Trend - ${selectedPeriod === 'custom' ? 'Custom Period' : selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`}
          />
          <CategoryPieChart 
            data={categoryPerformance} 
            title="Sales by Category"
          />
        </div>

        {/* Top Products Table */}
        <ReportTable
          data={productPerformance}
          columns={productPerformanceColumns}
          title="Top Performing Products"
          pageSize={5}
        />

        {/* Export Controls */}
        <ExportControls
          data={filteredOrders}
          filename="dashboard_report"
          title="Dashboard Report"
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Total Revenue</h4>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(currentMetrics.totalSales)}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Orders</h4>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {currentMetrics.totalOrders.toLocaleString()}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Avg Order Value</h4>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(currentMetrics.averageOrderValue)}
            </p>
          </Card>

          <Card className="p-6 text-center">
            <CreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Tax Collected</h4>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(currentMetrics.totalTax)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}