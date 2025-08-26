'use client'

import { useState } from 'react'
import { Download, FileText, Table, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExportOptions } from '@/types'
import * as Papa from 'papaparse'

interface ExportControlsProps {
  data: any[]
  filename: string
  title: string
  onExportPDF?: () => void
  onPrint?: () => void
  className?: string
}

export function ExportControls({
  data,
  filename,
  title,
  onExportPDF,
  onPrint,
  className = ""
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    setIsExporting(true)
    
    try {
      // Convert data to CSV format
      const csv = Papa.unparse(data, {
        header: true,
        skipEmptyLines: true
      })

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV file')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  const handleExportPDF = () => {
    if (onExportPDF) {
      setIsExporting(true)
      onExportPDF()
      setTimeout(() => setIsExporting(false), 2000) // Reset after 2 seconds
    } else {
      alert('PDF export not implemented for this report')
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h4 className="font-medium text-gray-900">Export Options</h4>
          <p className="text-sm text-gray-600">Download or print this report</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={isExporting || !data || data.length === 0}
            className="flex items-center space-x-2"
          >
            <Table className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          
          {onExportPDF && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting || !data || data.length === 0}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
        </div>
      </div>
      
      {isExporting && (
        <div className="mt-4 text-sm text-blue-600">
          Preparing export...
        </div>
      )}
    </Card>
  )
}

// Utility function to prepare data for export
export function prepareDataForExport(data: any[], columns?: string[]): any[] {
  if (!data || data.length === 0) return []
  
  if (columns) {
    return data.map(item => {
      const filtered: any = {}
      columns.forEach(col => {
        if (item.hasOwnProperty(col)) {
          filtered[col] = item[col]
        }
      })
      return filtered
    })
  }
  
  return data
}

// Format data for better CSV export
export function formatDataForCSV(data: any[]): any[] {
  return data.map(item => {
    const formatted: any = {}
    
    Object.keys(item).forEach(key => {
      let value = item[key]
      
      // Format dates
      if (value instanceof Date) {
        value = value.toLocaleDateString()
      }
      
      // Format numbers that look like currency
      if (typeof value === 'number' && (key.includes('price') || key.includes('revenue') || key.includes('total') || key.includes('amount'))) {
        value = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      }
      
      // Format percentages
      if (typeof value === 'number' && key.includes('percentage')) {
        value = `${value.toFixed(1)}%`
      }
      
      formatted[key] = value
    })
    
    return formatted
  })
}

// Quick export functions for common data types
export const exportProductPerformance = (data: any[], filename = 'product_performance') => {
  const formattedData = formatDataForCSV(data)
  const csv = Papa.unparse(formattedData)
  downloadCSV(csv, filename)
}

export const exportSalesData = (data: any[], filename = 'sales_report') => {
  const formattedData = formatDataForCSV(data)
  const csv = Papa.unparse(formattedData)
  downloadCSV(csv, filename)
}

export const exportCategoryPerformance = (data: any[], filename = 'category_performance') => {
  const formattedData = formatDataForCSV(data)
  const csv = Papa.unparse(formattedData)
  downloadCSV(csv, filename)
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}