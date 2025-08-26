import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
    },
  })

  const food = await prisma.category.create({
    data: {
      name: 'Food',
    },
  })

  const snacks = await prisma.category.create({
    data: {
      name: 'Snacks',
    },
  })

  // Create products
  const products = [
    // Beverages
    {
      name: 'Coffee',
      description: 'Fresh brewed coffee',
      price: 25000,
      categoryId: beverages.id,
      imageUrl: 'https://via.placeholder.com/200x200/8B4513/FFFFFF?text=Coffee',
      stock: 50,
    },
    {
      name: 'Tea',
      description: 'Hot tea selection',
      price: 15000,
      categoryId: beverages.id,
      imageUrl: 'https://via.placeholder.com/200x200/228B22/FFFFFF?text=Tea',
      stock: 40,
    },
    {
      name: 'Orange Juice',
      description: 'Fresh orange juice',
      price: 20000,
      categoryId: beverages.id,
      imageUrl: 'https://via.placeholder.com/200x200/FFA500/FFFFFF?text=Orange+Juice',
      stock: 30,
    },
    // Food
    {
      name: 'Nasi Goreng',
      description: 'Indonesian fried rice',
      price: 35000,
      categoryId: food.id,
      imageUrl: 'https://via.placeholder.com/200x200/D2691E/FFFFFF?text=Nasi+Goreng',
      stock: 25,
    },
    {
      name: 'Mie Ayam',
      description: 'Chicken noodle soup',
      price: 30000,
      categoryId: food.id,
      imageUrl: 'https://via.placeholder.com/200x200/DAA520/FFFFFF?text=Mie+Ayam',
      stock: 20,
    },
    {
      name: 'Gado-Gado',
      description: 'Indonesian salad with peanut sauce',
      price: 28000,
      categoryId: food.id,
      imageUrl: 'https://via.placeholder.com/200x200/32CD32/FFFFFF?text=Gado-Gado',
      stock: 15,
    },
    // Snacks
    {
      name: 'Keripik Singkong',
      description: 'Cassava chips',
      price: 12000,
      categoryId: snacks.id,
      imageUrl: 'https://via.placeholder.com/200x200/DEB887/FFFFFF?text=Keripik',
      stock: 60,
    },
    {
      name: 'Kacang Goreng',
      description: 'Fried peanuts',
      price: 10000,
      categoryId: snacks.id,
      imageUrl: 'https://via.placeholder.com/200x200/CD853F/FFFFFF?text=Kacang',
      stock: 80,
    },
    {
      name: 'Pisang Goreng',
      description: 'Fried banana',
      price: 15000,
      categoryId: snacks.id,
      imageUrl: 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Pisang+Goreng',
      stock: 35,
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })