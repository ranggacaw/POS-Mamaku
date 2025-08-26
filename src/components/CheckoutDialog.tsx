'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { PaymentMethod, CreateOrderRequest } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Banknote, Smartphone, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { ReceiptDialog } from '@/components/ReceiptDialog'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { state, clearCart } = useCart()
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<any>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const paymentMethods = [
    { id: 'cash' as PaymentMethod, name: 'Cash', icon: Banknote },
    { id: 'card' as PaymentMethod, name: 'Card', icon: CreditCard },
    { id: 'mobile' as PaymentMethod, name: 'Mobile Payment', icon: Smartphone },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCheckout = async () => {
    if (state.items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setIsProcessing(true)

    try {
      const orderData: CreateOrderRequest = {
        items: state.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        paymentMethod: selectedPayment,
        subtotal: state.subtotal,
        tax: state.tax,
        total: state.total,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()
      
      setCompletedOrder(order)
      clearCart()
      onOpenChange(false)
      setShowReceipt(true)
      
      toast.success('Order completed successfully!')
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to complete order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Checkout</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-3" />
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(state.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>{formatPrice(state.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatPrice(state.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <div>
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="grid grid-cols-1 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <Button
                      key={method.id}
                      variant={selectedPayment === method.id ? 'default' : 'outline'}
                      onClick={() => setSelectedPayment(method.id)}
                      className="justify-start h-12"
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {method.name}
                      {selectedPayment === method.id && (
                        <Badge className="ml-auto">Selected</Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                className="flex-1"
                disabled={isProcessing || state.items.length === 0}
              >
                {isProcessing ? 'Processing...' : `Pay ${formatPrice(state.total)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {completedOrder && (
        <ReceiptDialog
          open={showReceipt}
          onOpenChange={setShowReceipt}
          order={completedOrder}
        />
      )}
    </>
  )
}