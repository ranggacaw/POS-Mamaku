'use client'

import { ShoppingCart, Store, BarChart3 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Header() {
  const { state } = useCart()
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">POS Mamaku</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Reports Button */}
            <Link href="/reports">
              <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Reports</span>
              </Button>
            </Link>
            
            {/* Mobile Reports Button */}
            <Link href="/reports" className="md:hidden">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </Link>
            
            {/* Cart Info */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </div>
              <span className="text-sm text-gray-600 hidden sm:block">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}