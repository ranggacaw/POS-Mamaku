'use client'

import { useState, useEffect } from 'react'
import { Product, Category } from '@/types'
import { ProductGrid } from '@/components/ProductGrid'
import { Cart } from '@/components/Cart'
import { CategoryFilter } from '@/components/CategoryFilter'
import { Header } from '@/components/Header'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ])

        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.categoryId === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <div className="mt-4">
            <ProductGrid products={filteredProducts} />
          </div>
          <div className="mt-6">
            <Cart />
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden md:block">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <ProductGrid products={filteredProducts} />
            </div>
            <div>
              <Cart />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
