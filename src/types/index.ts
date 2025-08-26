export interface Category {
  id: string
  name: string
  _count?: {
    products: number
  }
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  categoryId: string
  imageUrl: string | null
  stock: number
  createdAt: Date
  updatedAt: Date
  category: Category
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product: Product
}

export interface Order {
  id: string
  total: number
  tax: number
  subtotal: number
  status: string
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
  orderItems: OrderItem[]
}

export interface CreateOrderRequest {
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  paymentMethod: string
  subtotal: number
  tax: number
  total: number
}

export type PaymentMethod = 'cash' | 'card' | 'mobile'

// Reporting Types
export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface ReportFilters {
  dateRange: DateRange
  categoryId?: string
  productId?: string
  paymentMethod?: PaymentMethod
}

export interface SalesMetrics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  totalTax: number
  totalSubtotal: number
}

export interface SalesReportData {
  date: string
  sales: number
  orders: number
  averageOrderValue: number
}

export interface ProductPerformance {
  productId: string
  productName: string
  categoryName: string
  quantitySold: number
  revenue: number
  averagePrice: number
  stock: number
}

export interface CategoryPerformance {
  categoryId: string
  categoryName: string
  totalRevenue: number
  totalQuantity: number
  productCount: number
  averagePrice: number
}

export interface PaymentMethodAnalysis {
  paymentMethod: PaymentMethod
  totalAmount: number
  orderCount: number
  percentage: number
}

export interface HourlyAnalysis {
  hour: number
  orderCount: number
  totalSales: number
  averageOrderValue: number
}

export interface DailyAnalysis {
  date: string
  dayOfWeek: string
  orderCount: number
  totalSales: number
  averageOrderValue: number
}

export interface ReportSummary {
  period: string
  metrics: SalesMetrics
  topProducts: ProductPerformance[]
  categoryPerformance: CategoryPerformance[]
  paymentMethods: PaymentMethodAnalysis[]
  peakHours: HourlyAnalysis[]
  dailyTrends: DailyAnalysis[]
}

export type ReportType = 'sales' | 'products' | 'transactions'
export type ReportPeriod = 'day' | 'week' | 'month' | 'year' | 'custom'

export interface ExportOptions {
  format: 'pdf' | 'csv'
  includeCharts?: boolean
  fileName?: string
}