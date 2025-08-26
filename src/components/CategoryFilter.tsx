'use client'

import { Category } from '@/types'
import { Button } from '@/components/ui/button'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        onClick={() => onCategoryChange('all')}
        className="text-sm"
      >
        All Items
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id)}
          className="text-sm"
        >
          {category.name}
          {category._count && (
            <span className="ml-1 text-xs opacity-70">
              ({category._count.products})
            </span>
          )}
        </Button>
      ))}
    </div>
  )
}