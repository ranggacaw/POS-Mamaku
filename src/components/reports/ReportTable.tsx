'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/reportUtils'

interface Column {
  key: string
  label: string
  sortable?: boolean
  format?: (value: any) => string
  align?: 'left' | 'center' | 'right'
}

interface ReportTableProps {
  data: any[]
  columns: Column[]
  title: string
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
  className?: string
}

export function ReportTable({
  data,
  columns,
  title,
  searchable = true,
  searchPlaceholder = "Search...",
  pageSize = 10,
  className = ""
}: ReportTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search term
  const filteredData = data.filter(item =>
    searchTerm === '' || 
    columns.some(column => {
      const value = item[column.key]
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  )

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUp className="h-4 w-4 text-gray-300" />
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-gray-600" />
      : <ChevronDown className="h-4 w-4 text-gray-600" />
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile view - Card layout */}
      <div className="md:hidden space-y-4">
        {paginatedData.map((item, index) => (
          <Card key={index} className="p-4">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-600">{column.label}:</span>
                <span className="text-sm text-gray-900">
                  {column.format ? column.format(item[column.key]) : item[column.key]}
                </span>
              </div>
            ))}
          </Card>
        ))}
      </div>

      {/* Desktop view - Table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`py-3 px-4 text-sm font-medium text-gray-700 ${
                    column.align === 'right' ? 'text-right' : 
                    column.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center space-x-1 hover:text-gray-900"
                    >
                      <span>{column.label}</span>
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-3 px-4 text-sm text-gray-900 ${
                      column.align === 'right' ? 'text-right' : 
                      column.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {column.format ? column.format(item[column.key]) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {paginatedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No results found for your search.' : 'No data available.'}
        </div>
      )}
    </Card>
  )
}

// Predefined table configurations for common report types
export const productPerformanceColumns: Column[] = [
  { key: 'productName', label: 'Product', sortable: true },
  { key: 'categoryName', label: 'Category', sortable: true },
  { key: 'quantitySold', label: 'Qty Sold', sortable: true, align: 'right' },
  { key: 'revenue', label: 'Revenue', sortable: true, align: 'right', format: formatCurrency },
  { key: 'averagePrice', label: 'Avg Price', sortable: true, align: 'right', format: formatCurrency },
  { key: 'stock', label: 'Stock', sortable: true, align: 'right' }
]

export const categoryPerformanceColumns: Column[] = [
  { key: 'categoryName', label: 'Category', sortable: true },
  { key: 'totalRevenue', label: 'Revenue', sortable: true, align: 'right', format: formatCurrency },
  { key: 'totalQuantity', label: 'Items Sold', sortable: true, align: 'right' },
  { key: 'productCount', label: 'Products', sortable: true, align: 'right' },
  { key: 'averagePrice', label: 'Avg Price', sortable: true, align: 'right', format: formatCurrency }
]

export const paymentMethodColumns: Column[] = [
  { key: 'paymentMethod', label: 'Payment Method', sortable: true },
  { key: 'totalAmount', label: 'Total Amount', sortable: true, align: 'right', format: formatCurrency },
  { key: 'orderCount', label: 'Orders', sortable: true, align: 'right' },
  { key: 'percentage', label: 'Percentage', sortable: true, align: 'right', format: (value: number) => `${value.toFixed(1)}%` }
]