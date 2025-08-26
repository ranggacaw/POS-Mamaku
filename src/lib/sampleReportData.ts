import { Order, Product, Category, OrderItem } from '@/types'
import { subDays, subHours, addHours } from 'date-fns'

// Sample categories
export const sampleCategories: Category[] = [
  { id: 'cat1', name: 'Beverages' },
  { id: 'cat2', name: 'Food' },
  { id: 'cat3', name: 'Desserts' },
  { id: 'cat4', name: 'Snacks' }
]

// Sample products
export const sampleProducts: Product[] = [
  {
    id: 'prod1',
    name: 'Espresso',
    description: 'Strong coffee shot',
    price: 25000,
    categoryId: 'cat1',
    imageUrl: null,
    stock: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: sampleCategories[0]
  },
  {
    id: 'prod2',
    name: 'Cappuccino',
    description: 'Coffee with steamed milk',
    price: 35000,
    categoryId: 'cat1',
    imageUrl: null,
    stock: 80,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: sampleCategories[0]
  },
  {
    id: 'prod3',
    name: 'Latte',
    description: 'Coffee with lots of milk',
    price: 40000,
    categoryId: 'cat1',
    imageUrl: null,
    stock: 75,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: sampleCategories[0]
  },
  {
    id: 'prod4',
    name: 'Nasi Goreng',
    description: 'Indonesian fried rice',
    price: 45000,
    categoryId: 'cat2',
    imageUrl: null,
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: sampleCategories[1]
  },
  {
    id: 'prod5',
    name: 'Mie Ayam',
    description: 'Chicken noodles',
    price: 35000,
    categoryId: 'cat2',
    imageUrl: null,
    stock: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: sampleCategories[1]
  },
  {
    id: 'prod6',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake',
    price: 30000,
    categoryId: 'cat3',
    imageUrl: null,
    stock: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: sampleCategories[2]
  },
  {
    id: 'prod7',
    name: 'Cheesecake',
    description: 'Creamy cheesecake',
    price: 35000,
    categoryId: 'cat3',
    imageUrl: null,
    stock: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: sampleCategories[2]
  },
  {
    id: 'prod8',
    name: 'French Fries',
    description: 'Crispy potato fries',
    price: 20000,
    categoryId: 'cat4',
    imageUrl: null,
    stock: 40,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: sampleCategories[3]
  }
]

// Generate sample orders for the last 6 months
export function generateSampleOrders(): Order[] {
  const orders: Order[] = []
  const paymentMethods = ['cash', 'card', 'mobile']
  const now = new Date()
  
  // Generate orders for the last 180 days
  for (let dayOffset = 0; dayOffset < 180; dayOffset++) {
    const baseDate = subDays(now, dayOffset)
    
    // Generate 3-15 orders per day with varying patterns
    const ordersPerDay = Math.floor(Math.random() * 13) + 3
    
    for (let orderIndex = 0; orderIndex < ordersPerDay; orderIndex++) {
      // Distribute orders throughout business hours (8 AM - 10 PM)
      const hour = Math.floor(Math.random() * 14) + 8
      const minute = Math.floor(Math.random() * 60)
      const orderDate = addHours(baseDate, hour - baseDate.getHours())
      orderDate.setMinutes(minute)
      
      // Generate 1-4 items per order
      const itemCount = Math.floor(Math.random() * 4) + 1
      const orderItems: OrderItem[] = []
      let subtotal = 0
      
      for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
        const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
        const quantity = Math.floor(Math.random() * 3) + 1
        const price = product.price
        
        orderItems.push({
          id: `item_${dayOffset}_${orderIndex}_${itemIndex}`,
          orderId: `order_${dayOffset}_${orderIndex}`,
          productId: product.id,
          quantity,
          price,
          product
        })
        
        subtotal += price * quantity
      }
      
      const tax = subtotal * 0.1
      const total = subtotal + tax
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      
      orders.push({
        id: `order_${dayOffset}_${orderIndex}`,
        total,
        tax,
        subtotal,
        status: 'completed',
        paymentMethod,
        createdAt: orderDate,
        updatedAt: orderDate,
        orderItems
      })
    }
  }
  
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Generate sample data with seasonal patterns
export function generateSeasonalSampleOrders(): Order[] {
  const orders: Order[] = []
  const paymentMethods = ['cash', 'card', 'mobile']
  const now = new Date()
  
  for (let dayOffset = 0; dayOffset < 180; dayOffset++) {
    const baseDate = subDays(now, dayOffset)
    const dayOfWeek = baseDate.getDay()
    const month = baseDate.getMonth()
    
    // Weekend boost (Friday, Saturday, Sunday)
    let weekendMultiplier = 1
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      weekendMultiplier = 1.5
    }
    
    // Holiday season boost (November, December)
    let seasonalMultiplier = 1
    if (month === 10 || month === 11) {
      seasonalMultiplier = 1.3
    }
    
    // Base orders per day with multipliers
    const baseOrdersPerDay = 8
    const ordersPerDay = Math.floor(baseOrdersPerDay * weekendMultiplier * seasonalMultiplier) + Math.floor(Math.random() * 5)
    
    for (let orderIndex = 0; orderIndex < ordersPerDay; orderIndex++) {
      // Peak hours: 7-9 AM, 12-2 PM, 6-8 PM
      let hour: number
      const timeSlot = Math.random()
      if (timeSlot < 0.3) {
        hour = Math.floor(Math.random() * 3) + 7 // 7-9 AM
      } else if (timeSlot < 0.6) {
        hour = Math.floor(Math.random() * 3) + 12 // 12-2 PM
      } else if (timeSlot < 0.8) {
        hour = Math.floor(Math.random() * 3) + 18 // 6-8 PM
      } else {
        hour = Math.floor(Math.random() * 14) + 8 // Any business hour
      }
      
      const minute = Math.floor(Math.random() * 60)
      const orderDate = new Date(baseDate)
      orderDate.setHours(hour, minute, 0, 0)
      
      // Generate order items with product preferences
      const itemCount = Math.floor(Math.random() * 4) + 1
      const orderItems: OrderItem[] = []
      let subtotal = 0
      
      // Beverage preference in morning, food preference at lunch/dinner
      let productPool = sampleProducts
      if (hour >= 7 && hour <= 10) {
        // Morning: prefer beverages
        productPool = sampleProducts.filter(p => p.categoryId === 'cat1' || Math.random() < 0.3)
      } else if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 20)) {
        // Meal times: prefer food
        productPool = sampleProducts.filter(p => p.categoryId === 'cat2' || Math.random() < 0.4)
      }
      
      for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
        const product = productPool[Math.floor(Math.random() * productPool.length)]
        const quantity = Math.floor(Math.random() * 3) + 1
        const price = product.price
        
        orderItems.push({
          id: `item_${dayOffset}_${orderIndex}_${itemIndex}`,
          orderId: `order_${dayOffset}_${orderIndex}`,
          productId: product.id,
          quantity,
          price,
          product
        })
        
        subtotal += price * quantity
      }
      
      const tax = subtotal * 0.1
      const total = subtotal + tax
      
      // Payment method preferences: cash more common in morning, cards in evening
      let paymentMethod: string
      if (hour <= 10) {
        paymentMethod = Math.random() < 0.6 ? 'cash' : (Math.random() < 0.5 ? 'card' : 'mobile')
      } else {
        paymentMethod = Math.random() < 0.4 ? 'cash' : (Math.random() < 0.6 ? 'card' : 'mobile')
      }
      
      orders.push({
        id: `order_${dayOffset}_${orderIndex}`,
        total,
        tax,
        subtotal,
        status: 'completed',
        paymentMethod,
        createdAt: orderDate,
        updatedAt: orderDate,
        orderItems
      })
    }
  }
  
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Export the main sample data
export const sampleOrders = generateSeasonalSampleOrders()