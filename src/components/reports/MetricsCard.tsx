'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatPercentage, calculateGrowth } from '@/lib/reportUtils'

interface MetricCardProps {
  title: string
  value: number | string
  previousValue?: number
  format?: 'currency' | 'number' | 'percentage' | 'custom'
  customFormatter?: (value: any) => string
  icon?: React.ReactNode
  className?: string
  showTrend?: boolean
}

export function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  customFormatter,
  icon,
  className = "",
  showTrend = true
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (customFormatter) return customFormatter(val)
    
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return formatPercentage(val)
      case 'number':
        return val.toLocaleString()
      default:
        return val.toString()
    }
  }

  const getTrendInfo = () => {
    if (!showTrend || previousValue === undefined || typeof value !== 'number') {
      return null
    }

    const growth = calculateGrowth(value, previousValue)
    const isPositive = growth > 0
    const isNegative = growth < 0
    const isNeutral = growth === 0

    return {
      growth,
      isPositive,
      isNegative,
      isNeutral,
      icon: isPositive ? TrendingUp : isNegative ? TrendingDown : Minus,
      color: isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'
    }
  }

  const trendInfo = getTrendInfo()

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </p>
          
          {trendInfo && (
            <div className={`flex items-center space-x-1 text-sm ${trendInfo.color}`}>
              <trendInfo.icon className="h-4 w-4" />
              <span>
                {Math.abs(trendInfo.growth).toFixed(1)}%
              </span>
              <span className="text-gray-500">vs previous period</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

interface MetricsGridProps {
  metrics: Array<{
    title: string
    value: number | string
    previousValue?: number
    format?: 'currency' | 'number' | 'percentage' | 'custom'
    customFormatter?: (value: any) => string
    icon?: React.ReactNode
    showTrend?: boolean
  }>
  className?: string
}

export function MetricsGrid({ metrics, className = "" }: MetricsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          previousValue={metric.previousValue}
          format={metric.format}
          customFormatter={metric.customFormatter}
          icon={metric.icon}
          showTrend={metric.showTrend}
        />
      ))}
    </div>
  )
}

// Predefined metric configurations
export const salesMetricsConfig = (current: any, previous?: any) => [
  {
    title: "Total Sales",
    value: current.totalSales,
    previousValue: previous?.totalSales,
    format: 'currency' as const,
    icon: <TrendingUp className="h-6 w-6 text-blue-600" />
  },
  {
    title: "Total Orders",
    value: current.totalOrders,
    previousValue: previous?.totalOrders,
    format: 'number' as const,
    icon: <TrendingUp className="h-6 w-6 text-green-600" />
  },
  {
    title: "Average Order Value",
    value: current.averageOrderValue,
    previousValue: previous?.averageOrderValue,
    format: 'currency' as const,
    icon: <TrendingUp className="h-6 w-6 text-purple-600" />
  },
  {
    title: "Total Tax",
    value: current.totalTax,
    previousValue: previous?.totalTax,
    format: 'currency' as const,
    icon: <TrendingUp className="h-6 w-6 text-orange-600" />
  }
]

// Quick stats component for dashboard overview
interface QuickStatsProps {
  todaySales: number
  yesterdaySales: number
  weekSales: number
  lastWeekSales: number
  monthSales: number
  lastMonthSales: number
  totalOrders: number
  className?: string
}

export function QuickStats({
  todaySales,
  yesterdaySales,
  weekSales,
  lastWeekSales,
  monthSales,
  lastMonthSales,
  totalOrders,
  className = ""
}: QuickStatsProps) {
  const metrics = [
    {
      title: "Today's Sales",
      value: todaySales,
      previousValue: yesterdaySales,
      format: 'currency' as const,
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />
    },
    {
      title: "This Week",
      value: weekSales,
      previousValue: lastWeekSales,
      format: 'currency' as const,
      icon: <TrendingUp className="h-6 w-6 text-green-600" />
    },
    {
      title: "This Month",
      value: monthSales,
      previousValue: lastMonthSales,
      format: 'currency' as const,
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />
    },
    {
      title: "Total Orders",
      value: totalOrders,
      format: 'number' as const,
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      showTrend: false
    }
  ]

  return <MetricsGrid metrics={metrics} className={className} />
}