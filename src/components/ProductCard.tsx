'use client'

import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { useMemo, useState } from 'react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [imgError, setImgError] = useState(false)

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock')
      return
    }
    
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Prefer a local placeholder if we either have no URL or the remote failed
  const imageSrc = useMemo(() => {
    if (!product.imageUrl || imgError) return '/placeholder-product.svg'
    return product.imageUrl
  }, [product.imageUrl, imgError])

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex-1">
        <div className="aspect-square relative mb-3 bg-gray-100 rounded-lg overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              // Avoid Next.js server-side image proxy to prevent 500 on ENOTFOUND
              unoptimized
              onError={() => setImgError(true)}
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
            <Badge variant="secondary" className="text-xs ml-2">
              {product.category.name}
            </Badge>
          </div>
          
          {product.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-blue-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-500">
              Stock: {product.stock}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}