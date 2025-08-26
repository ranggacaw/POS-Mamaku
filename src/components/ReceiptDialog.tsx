'use client'

import { Order } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Receipt, Download, Printer } from 'lucide-react'

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function ReceiptDialog({ open, onOpenChange, order }: ReceiptDialogProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a simple text receipt
    const receiptText = `
POS MAMAKU - RECEIPT
====================

Order ID: ${order.id}
Date: ${formatDate(order.createdAt)}
Payment: ${order.paymentMethod.toUpperCase()}

ITEMS:
${order.orderItems.map(item => 
  `${item.product.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
).join('\n')}

--------------------
Subtotal: ${formatPrice(order.subtotal)}
Tax (10%): ${formatPrice(order.tax)}
TOTAL: ${formatPrice(order.total)}

Thank you for your purchase!
    `.trim()

    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${order.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Receipt</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4" id="receipt-content">
          {/* Receipt Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold">POS MAMAKU</h2>
            <p className="text-sm text-gray-600">Point of Sale System</p>
          </div>

          <Separator />

          {/* Order Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span className="font-mono">{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            <h3 className="font-semibold">Items:</h3>
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <div>{item.product.name}</div>
                  <div className="text-gray-500">
                    {formatPrice(item.price)} x {item.quantity}
                  </div>
                </div>
                <div className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-blue-600">{formatPrice(order.total)}</span>
            </div>
          </div>

          <Separator />

          <div className="text-center text-sm text-gray-600">
            <p>Thank you for your purchase!</p>
            <p>Please come again</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}