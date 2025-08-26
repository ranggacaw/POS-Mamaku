'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ReportPeriod } from '@/types'
import { format } from 'date-fns'

interface DateRangeSelectorProps {
  selectedPeriod: ReportPeriod
  customDateRange?: { startDate: Date; endDate: Date }
  onPeriodChange: (period: ReportPeriod) => void
  onCustomDateChange: (range: { startDate: Date; endDate: Date }) => void
}

export function DateRangeSelector({
  selectedPeriod,
  customDateRange,
  onPeriodChange,
  onCustomDateChange
}: DateRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(selectedPeriod === 'custom')
  const [startDate, setStartDate] = useState(
    customDateRange?.startDate ? format(customDateRange.startDate, 'yyyy-MM-dd') : ''
  )
  const [endDate, setEndDate] = useState(
    customDateRange?.endDate ? format(customDateRange.endDate, 'yyyy-MM-dd') : ''
  )

  const handlePeriodChange = (period: ReportPeriod) => {
    onPeriodChange(period)
    setShowCustom(period === 'custom')
  }

  const handleCustomDateSubmit = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // Set to end of day
      onCustomDateChange({ startDate: start, endDate: end })
    }
  }

  const periodLabels = {
    day: 'Today',
    week: 'Last 7 Days',
    month: 'Last 30 Days',
    year: 'Last Year',
    custom: 'Custom Range'
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Date Range</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(periodLabels).map(([period, label]) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange(period as ReportPeriod)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>

        {showCustom && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <Button
              onClick={handleCustomDateSubmit}
              disabled={!startDate || !endDate}
              size="sm"
              className="w-full md:w-auto"
            >
              Apply Custom Range
            </Button>
          </div>
        )}

        {selectedPeriod !== 'custom' && (
          <div className="text-sm text-gray-600">
            Showing data for: <span className="font-medium">{periodLabels[selectedPeriod]}</span>
          </div>
        )}

        {selectedPeriod === 'custom' && customDateRange && (
          <div className="text-sm text-gray-600">
            Showing data from{' '}
            <span className="font-medium">
              {format(customDateRange.startDate, 'MMM dd, yyyy')}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {format(customDateRange.endDate, 'MMM dd, yyyy')}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}