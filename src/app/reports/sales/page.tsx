'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Calendar, DollarSign, ShoppingBag } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MetricsGrid, salesMetricsConfig } from '@/components/reports/MetricsCard'
import { DailySalesChart, SalesChart } from '@/components/reports/SalesChart'
import { DateRangeSelector } from '@/components/reports/DateRangeSelector'
import { ExportControls } from '@/components/reports/ExportControls'
import {
  calculateSalesMetrics,
  generateDailySalesData,
  filterOrders,
  getDateRange,
  formatCurrency,
  calculateProductPerformance,
  calculateCategoryPerformance,
  analyzePaymentMethods
} from '@/lib/reportUtils'
import { generateSalesReportPDF } from '@/lib/pdfExport'
import { ReportPeriod, Order } from '@/types'
import Link from 'next/link'
import { format, subDays, subWeeks, subMonths } from 'date-fns'

export default function SalesReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month')
  const [customDateRange, setCustomDateRange] = useState<{ startDate: Date; endDate: Date }>()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [previousPeriodOrders, setPreviousPeriodOrders] = useState<Order[]>([])
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

    // Calculate previous period for comparison
    const daysDiff = Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const previousDateRange = {
      startDate: subDays(dateRange.startDate, daysDiff),
      endDate: subDays(dateRange.endDate, daysDiff)
    }

    const previousFiltered = filterOrders(orders, { dateRange: previousDateRange })
    setPreviousPeriodOrders(previousFiltered)
  }, [orders, selectedPeriod, customDateRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading sales report...</div>
      </div>
    )
  }

  const currentMetrics = calculateSalesMetrics(filteredOrders)
  const previousMetrics = calculateSalesMetrics(previousPeriodOrders)
  const dailySalesData = generateDailySalesData(
    filteredOrders, 
    selectedPeriod === 'custom' && customDateRange 
      ? customDateRange 
      : getDateRange(selectedPeriod)
  )

  // Generate hourly sales data
  const hourlySalesData = Array.from({ length: 24 }, (_, hour) => {
    const hourOrders = filteredOrders.filter(order => {
      const orderHour = new Date(order.createdAt).getHours()
      return orderHour === hour
    })
    const sales = hourOrders.reduce((sum, order) => sum + order.total, 0)
    return {
      hour: `${hour}:00`,
      sales,
      orders: hourOrders.length
    }
  }).filter(data => data.sales > 0)

  // Generate weekly comparison data
  const weeklyData = []
  const weeks = Math.ceil(dailySalesData.length / 7)
  for (let i = 0; i < weeks; i++) {
    const weekData = dailySalesData.slice(i * 7, (i + 1) * 7)
    const weekSales = weekData.reduce((sum, day) => sum + day.sales, 0)
    const weekOrders = weekData.reduce((sum, day) => sum + day.orders, 0)
    weeklyData.push({
      week: `Week ${i + 1}`,
      sales: weekSales,
      orders: weekOrders,
      averageOrderValue: weekOrders > 0 ? weekSales / weekOrders : 0
    })
  }

  const metricsConfig = salesMetricsConfig(currentMetrics, previousMetrics)
  
  // Additional data for PDF export
  const productPerformance = calculateProductPerformance(filteredOrders)
  const categoryPerformance = calculateCategoryPerformance(filteredOrders)
  const paymentAnalysis = analyzePaymentMethods(filteredOrders)

  const handleExportPDF = async () => {
    const dateRangeText = selectedPeriod === 'custom' && customDateRange
      ? `${customDateRange.startDate.toLocaleDateString()} - ${customDateRange.endDate.toLocaleDateString()}`
      : `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Report`
    
    await generateSalesReportPDF(
      'Sales Report',
      dateRangeText,
      currentMetrics,
      productPerformance.slice(0, 10),
      categoryPerformance,
      paymentAnalysis
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
                <h1 className="text-3xl font-bold text-gray-900">Sales Reports</h1>
                <p className="text-gray-600 mt-1">Detailed sales analysis and trends</p>
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
        <MetricsGrid metrics={metricsConfig} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailySalesChart 
            data={dailySalesData} 
            title="Daily Sales Trend"
          />
          
          <SalesChart
            data={hourlySalesData}
            type="bar"
            title="Sales by Hour"
            xAxisKey="hour"
            yAxisKey="sales"
            color="#10B981"
            height={300}
          />
        </div>

        {/* Weekly Comparison */}
        {weeklyData.length > 1 && (
          <SalesChart
            data={weeklyData}
            type="bar"
            title="Weekly Sales Comparison"
            xAxisKey="week"
            yAxisKey="sales"
            color="#3B82F6"
            height={300}
          />
        )}

        {/* Detailed Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(currentMetrics.totalSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-medium">{formatCurrency(currentMetrics.totalTax)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-blue-600">{formatCurrency(currentMetrics.totalSales)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Order Statistics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-medium">{currentMetrics.totalOrders.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order Value:</span>
                <span className="font-medium">{formatCurrency(currentMetrics.averageOrderValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orders per Day:</span>
                <span className="font-medium">
                  {dailySalesData.length > 0 
                    ? Math.round(currentMetrics.totalOrders / dailySalesData.length)
                    : 0
                  }
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Best Day:</span>
                <span className="font-medium">
                  {dailySalesData.length > 0 
                    ? dailySalesData.reduce((best, day) => day.sales > best.sales ? day : best).date
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Hour:</span>
                <span className="font-medium">
                  {hourlySalesData.length > 0 
                    ? hourlySalesData.reduce((best, hour) => hour.sales > best.sales ? hour : best).hour
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Growth vs Previous:</span>
                <span className={`font-medium ${
                  currentMetrics.totalSales > previousMetrics.totalSales 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {previousMetrics.totalSales > 0 
                    ? `${(((currentMetrics.totalSales - previousMetrics.totalSales) / previousMetrics.totalSales) * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Export Controls */}
        <ExportControls
          data={filteredOrders}
          filename="sales_report"
          title="Sales Report"
          onExportPDF={handleExportPDF}
        />
      </div>
    </div>
  )
}