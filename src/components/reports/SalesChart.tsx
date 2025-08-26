'use client'

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/reportUtils'

interface ChartData {
  [key: string]: any
}

interface SalesChartProps {
  data: ChartData[]
  type: 'line' | 'bar' | 'pie'
  title: string
  xAxisKey: string
  yAxisKey: string
  color?: string
  colors?: string[]
  height?: number
  showLegend?: boolean
  formatValue?: (value: any) => string
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16'  // Lime
]

export function SalesChart({
  data,
  type,
  title,
  xAxisKey,
  yAxisKey,
  color = '#3B82F6',
  colors = DEFAULT_COLORS,
  height = 300,
  showLegend = false,
  formatValue = formatCurrency
}: SalesChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatValue(entry.value)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar 
              dataKey={yAxisKey} 
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [formatValue(value), yAxisKey]}
            />
            {showLegend && <Legend />}
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div>No data available</div>}
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// Specialized chart components for common use cases
export function DailySalesChart({ data, title = "Daily Sales" }: { data: any[], title?: string }) {
  return (
    <SalesChart
      data={data}
      type="line"
      title={title}
      xAxisKey="date"
      yAxisKey="sales"
      color="#3B82F6"
      height={300}
    />
  )
}

export function CategoryPieChart({ data, title = "Sales by Category" }: { data: any[], title?: string }) {
  return (
    <SalesChart
      data={data}
      type="pie"
      title={title}
      xAxisKey="categoryName"
      yAxisKey="totalRevenue"
      height={300}
      showLegend={true}
    />
  )
}

export function ProductBarChart({ data, title = "Top Products" }: { data: any[], title?: string }) {
  return (
    <SalesChart
      data={data.slice(0, 10)} // Show top 10 products
      type="bar"
      title={title}
      xAxisKey="productName"
      yAxisKey="revenue"
      color="#10B981"
      height={300}
    />
  )
}

export function HourlyPatternChart({ data, title = "Sales by Hour" }: { data: any[], title?: string }) {
  const formattedData = data.map(item => ({
    ...item,
    hour: `${item.hour}:00`
  }))

  return (
    <SalesChart
      data={formattedData}
      type="bar"
      title={title}
      xAxisKey="hour"
      yAxisKey="totalSales"
      color="#F59E0B"
      height={300}
    />
  )
}