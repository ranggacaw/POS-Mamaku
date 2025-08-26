'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, Clock, TrendingUp, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SalesChart, HourlyPatternChart } from '@/components/reports/SalesChart'
import { DateRangeSelector } from '@/components/reports/DateRangeSelector'
import { ReportTable, paymentMethodColumns } from '@/components/reports/ReportTable'
import { ExportControls } from '@/components/reports/ExportControls'
import { 
  analyzePaymentMethods,
  analyzeHourlyPatterns,
  analyzeDailyPatterns,
  filterOrders,
  getDateRange,
  formatCurrency,
  DAYS_OF_WEEK
} from '@/lib/reportUtils'
import { ReportPeriod, Order } from '@/types'
import Link from 'next/link'

export default function TransactionsReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month')
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
        <div className="text-lg">Loading transactions report...</div>
      </div>
    )
  }

  const paymentAnalysis = analyzePaymentMethods(filteredOrders)
  const hourlyPatterns = analyzeHourlyPatterns(filteredOrders)
  const dailyPatterns = analyzeDailyPatterns(filteredOrders)
  
  // Calculate transaction metrics
  const totalTransactions = filteredOrders.length
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
  
  // Find peak hour and day
  const peakHour = hourlyPatterns.length > 0 
    ? hourlyPatterns.reduce((peak, hour) => hour.orderCount > peak.orderCount ? hour : peak)
    : null
  
  const peakDay = dailyPatterns.length > 0 
    ? dailyPatterns.reduce((peak, day) => day.orderCount > peak.orderCount ? day : peak)
    : null

  // Prepare data for charts
  const paymentMethodChartData = paymentAnalysis.map(method => ({
    name: method.paymentMethod.charAt(0).toUpperCase() + method.paymentMethod.slice(1),
    value: method.totalAmount,
    count: method.orderCount,
    percentage: method.percentage
  }))

  const hourlyChartData = hourlyPatterns.map(hour => ({
    hour: `${hour.hour}:00`,
    orders: hour.orderCount,
    sales: hour.totalSales,
    averageOrderValue: hour.averageOrderValue
  }))

  const dailyChartData = dailyPatterns.map(day => ({
    day: day.date,
    dayOfWeek: day.dayOfWeek,
    orders: day.orderCount,
    sales: day.totalSales,
    averageOrderValue: day.averageOrderValue
  }))

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
                <h1 className="text-3xl font-bold text-gray-900">Transaction Reports</h1>
                <p className="text-gray-600 mt-1">Payment methods and transaction patterns analysis</p>
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
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageTransactionValue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold text-gray-900">
                  {peakHour ? `${peakHour.hour}:00` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart
            data={paymentMethodChartData}
            type="pie"
            title="Payment Methods Distribution"
            xAxisKey="name"
            yAxisKey="value"
            height={300}
            showLegend={true}
          />
          
          <SalesChart
            data={hourlyChartData}
            type="bar"
            title="Transaction Volume by Hour"
            xAxisKey="hour"
            yAxisKey="orders"
            color="#10B981"
            height={300}
            formatValue={(value) => `${value} orders`}
          />
        </div>

        {/* Daily Patterns Chart */}
        <SalesChart
          data={dailyChartData}
          type="line"
          title="Daily Transaction Patterns"
          xAxisKey="day"
          yAxisKey="orders"
          color="#3B82F6"
          height={300}
          formatValue={(value) => `${value} orders`}
        />

        {/* Payment Methods Analysis */}
        <ReportTable
          data={paymentAnalysis}
          columns={paymentMethodColumns}
          title="Payment Methods Analysis"
          searchable={false}
          pageSize={10}
        />

        {/* Insights Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Peak Hours</h3>
            </div>
            <div className="space-y-3">
              {hourlyPatterns.slice(0, 5).map((hour, index) => (
                <div key={hour.hour} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{hour.hour}:00</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{hour.orderCount} orders</p>
                    <p className="text-sm text-gray-600">{formatCurrency(hour.totalSales)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Payment Preferences</h3>
            </div>
            <div className="space-y-3">
              {paymentAnalysis.map((method, index) => (
                <div key={method.paymentMethod} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 capitalize">{method.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{method.percentage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">{method.orderCount} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Transaction Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Busiest Day:</span>
                <span className="font-medium">
                  {peakDay ? `${peakDay.dayOfWeek}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Hour Orders:</span>
                <span className="font-medium">
                  {peakHour ? peakHour.orderCount : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Most Popular Payment:</span>
                <span className="font-medium capitalize">
                  {paymentAnalysis.length > 0 ? paymentAnalysis[0].paymentMethod : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Avg Transactions:</span>
                <span className="font-medium">
                  {dailyPatterns.length > 0 
                    ? Math.round(totalTransactions / dailyPatterns.length)
                    : 0
                  }
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Export Controls */}
        <ExportControls
          data={filteredOrders}
          filename="transactions_report"
          title="Transactions Report"
        />
      </div>
    </div>
  )
}