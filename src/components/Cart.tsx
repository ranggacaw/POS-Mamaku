'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CartItem } from '@/components/CartItem'
import { CheckoutDialog } from '@/components/CheckoutDialog'
import { ShoppingCart, Receipt } from 'lucide-react'

export function Cart() {
  const { state } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [includeTax, setIncludeTax] = useState(true)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <Card className="sticky top-4">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Shopping Cart</span>
            </div>
            {itemCount > 0 && (
              <Badge variant="secondary">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {state.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some items to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {state.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(state.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeTax}
                      onChange={(e) => setIncludeTax(e.target.checked)}
                    />
                    <span>Include Tax (10%)</span>
                  </label>
                  <span>{formatPrice(includeTax ? state.tax : 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {formatPrice(includeTax ? state.total : state.subtotal)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowCheckout(true)}
                className="w-full"
                size="lg"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Checkout
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
      />
    </>
  )
}