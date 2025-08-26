import { 
  Order, 
  Product, 
  Category,
  SalesMetrics,
  SalesReportData,
  ProductPerformance,
  CategoryPerformance,
  PaymentMethodAnalysis,
  HourlyAnalysis,
  DailyAnalysis,
  ReportFilters,
  PaymentMethod
} from '@/types'
import { format, startOfDay, endOfDay, subDays, subWeeks, subMonths, subYears, eachDayOfInterval, getHours, getDay } from 'date-fns'

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Date range utilities
export function getDateRange(period: string, customRange?: { startDate: Date; endDate: Date }) {
  const now = new Date()
  
  switch (period) {
    case 'day':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now)
      }
    case 'week':
      return {
        startDate: startOfDay(subDays(now, 7)),
        endDate: endOfDay(now)
      }
    case 'month':
      return {
        startDate: startOfDay(subMonths(now, 1)),
        endDate: endOfDay(now)
      }
    case 'year':
      return {
        startDate: startOfDay(subYears(now, 1)),
        endDate: endOfDay(now)
      }
    case 'custom':
      return customRange || {
        startDate: startOfDay(subDays(now, 30)),
        endDate: endOfDay(now)
      }
    default:
      return {
        startDate: startOfDay(subDays(now, 7)),
        endDate: endOfDay(now)
      }
  }
}

// Filter orders based on criteria
export function filterOrders(orders: Order[], filters: ReportFilters): Order[] {
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    const isInDateRange = orderDate >= filters.dateRange.startDate && orderDate <= filters.dateRange.endDate
    
    if (!isInDateRange) return false
    
    if (filters.paymentMethod && order.paymentMethod !== filters.paymentMethod) {
      return false
    }
    
    if (filters.categoryId) {
      const hasCategory = order.orderItems.some(item => 
        item.product.categoryId === filters.categoryId
      )
      if (!hasCategory) return false
    }
    
    if (filters.productId) {
      const hasProduct = order.orderItems.some(item => 
        item.productId === filters.productId
      )
      if (!hasProduct) return false
    }
    
    return true
  })
}

// Calculate sales metrics
export function calculateSalesMetrics(orders: Order[]): SalesMetrics {
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const totalTax = orders.reduce((sum, order) => sum + order.tax, 0)
  const totalSubtotal = orders.reduce((sum, order) => sum + order.subtotal, 0)
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
  
  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    totalTax,
    totalSubtotal
  }
}

// Generate daily sales data for charts
export function generateDailySalesData(orders: Order[], dateRange: { startDate: Date; endDate: Date }): SalesReportData[] {
  const days = eachDayOfInterval({ start: dateRange.startDate, end: dateRange.endDate })
  
  return days.map(day => {
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return format(orderDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    })
    
    const sales = dayOrders.reduce((sum, order) => sum + order.total, 0)
    const orderCount = dayOrders.length
    const averageOrderValue = orderCount > 0 ? sales / orderCount : 0
    
    return {
      date: format(day, 'MMM dd'),
      sales,
      orders: orderCount,
      averageOrderValue
    }
  })
}

// Calculate product performance
export function calculateProductPerformance(orders: Order[]): ProductPerformance[] {
  const productMap = new Map<string, {
    product: Product
    quantitySold: number
    revenue: number
    totalPrice: number
    orderCount: number
  }>()
  
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const existing = productMap.get(item.productId)
      if (existing) {
        existing.quantitySold += item.quantity
        existing.revenue += item.price * item.quantity
        existing.totalPrice += item.price
        existing.orderCount += 1
      } else {
        productMap.set(item.productId, {
          product: item.product,
          quantitySold: item.quantity,
          revenue: item.price * item.quantity,
          totalPrice: item.price,
          orderCount: 1
        })
      }
    })
  })
  
  return Array.from(productMap.values())
    .map(data => ({
      productId: data.product.id,
      productName: data.product.name,
      categoryName: data.product.category.name,
      quantitySold: data.quantitySold,
      revenue: data.revenue,
      averagePrice: data.totalPrice / data.orderCount,
      stock: data.product.stock
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

// Calculate category performance
export function calculateCategoryPerformance(orders: Order[]): CategoryPerformance[] {
  const categoryMap = new Map<string, {
    category: Category
    totalRevenue: number
    totalQuantity: number
    products: Set<string>
    totalPrice: number
    orderCount: number
  }>()
  
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      const categoryId = item.product.categoryId
      const existing = categoryMap.get(categoryId)
      
      if (existing) {
        existing.totalRevenue += item.price * item.quantity
        existing.totalQuantity += item.quantity
        existing.products.add(item.productId)
        existing.totalPrice += item.price
        existing.orderCount += 1
      } else {
        categoryMap.set(categoryId, {
          category: item.product.category,
          totalRevenue: item.price * item.quantity,
          totalQuantity: item.quantity,
          products: new Set([item.productId]),
          totalPrice: item.price,
          orderCount: 1
        })
      }
    })
  })
  
  return Array.from(categoryMap.values())
    .map(data => ({
      categoryId: data.category.id,
      categoryName: data.category.name,
      totalRevenue: data.totalRevenue,
      totalQuantity: data.totalQuantity,
      productCount: data.products.size,
      averagePrice: data.totalPrice / data.orderCount
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
}

// Analyze payment methods
export function analyzePaymentMethods(orders: Order[]): PaymentMethodAnalysis[] {
  const paymentMap = new Map<PaymentMethod, { totalAmount: number; orderCount: number }>()
  
  orders.forEach(order => {
    const method = order.paymentMethod as PaymentMethod
    const existing = paymentMap.get(method)
    
    if (existing) {
      existing.totalAmount += order.total
      existing.orderCount += 1
    } else {
      paymentMap.set(method, {
        totalAmount: order.total,
        orderCount: 1
      })
    }
  })
  
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0)
  
  return Array.from(paymentMap.entries())
    .map(([method, data]) => ({
      paymentMethod: method,
      totalAmount: data.totalAmount,
      orderCount: data.orderCount,
      percentage: totalAmount > 0 ? (data.totalAmount / totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
}

// Analyze hourly patterns
export function analyzeHourlyPatterns(orders: Order[]): HourlyAnalysis[] {
  const hourlyMap = new Map<number, { orderCount: number; totalSales: number }>()
  
  // Initialize all hours
  for (let hour = 0; hour < 24; hour++) {
    hourlyMap.set(hour, { orderCount: 0, totalSales: 0 })
  }
  
  orders.forEach(order => {
    const hour = getHours(new Date(order.createdAt))
    const existing = hourlyMap.get(hour)!
    existing.orderCount += 1
    existing.totalSales += order.total
  })
  
  return Array.from(hourlyMap.entries())
    .map(([hour, data]) => ({
      hour,
      orderCount: data.orderCount,
      totalSales: data.totalSales,
      averageOrderValue: data.orderCount > 0 ? data.totalSales / data.orderCount : 0
    }))
    .filter(data => data.orderCount > 0)
    .sort((a, b) => b.orderCount - a.orderCount)
}

// Analyze daily patterns
export function analyzeDailyPatterns(orders: Order[]): DailyAnalysis[] {
  const dailyMap = new Map<string, { orderCount: number; totalSales: number; dayOfWeek: string }>()
  
  orders.forEach(order => {
    const date = format(new Date(order.createdAt), 'yyyy-MM-dd')
    const dayOfWeek = DAYS_OF_WEEK[getDay(new Date(order.createdAt))]
    const existing = dailyMap.get(date)
    
    if (existing) {
      existing.orderCount += 1
      existing.totalSales += order.total
    } else {
      dailyMap.set(date, {
        orderCount: 1,
        totalSales: order.total,
        dayOfWeek
      })
    }
  })
  
  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date: format(new Date(date), 'MMM dd'),
      dayOfWeek: data.dayOfWeek,
      orderCount: data.orderCount,
      totalSales: data.totalSales,
      averageOrderValue: data.totalSales / data.orderCount
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

// Calculate growth percentage
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}