# POS Mamaku - Point of Sale System

A modern, responsive Point of Sale (POS) application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma ORM. Optimized for tablets and mobile devices.

## 🚀 Features

- **Responsive Design**: Optimized for mobile (390x844) and tablet (768x1024) devices
- **Product Management**: Browse products by categories with real-time stock tracking
- **Shopping Cart**: Add, remove, and modify quantities with automatic tax calculation
- **Payment Processing**: Support for Cash, Card, and Mobile Payment methods
- **Receipt Generation**: Professional receipts with print and download functionality
- **Real-time Updates**: Live cart updates and inventory management
- **Indonesian Localization**: Prices in Indonesian Rupiah (IDR) with local date formatting

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Context API** for state management
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for serverless functions
- **Prisma ORM** for database management
- **SQLite** database for development

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## 🚀 Quick Start

### **IMPORTANT: This is a Next.js Full-Stack Application**
- **Frontend + Backend run together** in a single command
- **No separate backend server needed** - Next.js API routes handle the backend
- **One command starts everything!**

### 1. Navigate to Project Directory

```bash
cd pos-mamaku
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

The `.env` file is already configured with:
```env
DATABASE_URL=""mysql://root@localhost:3306/pos_mamaku_db"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Initialize Database

```bash
# Create and migrate database
npx prisma db push

# Seed database with sample data
npm run db:seed
```

**Note for Windows Users**: If you encounter permission errors with Prisma generation, try:
- Running your terminal as Administrator
- Or use: `npx prisma generate --force-reset`

### 5. Start the Full-Stack Application (Frontend + Backend)

```bash
npm run dev
```

**This single command starts:**
- ✅ **Frontend**: React/Next.js UI at `http://localhost:3000`
- ✅ **Backend**: API routes at `http://localhost:3000/api/*`
- ✅ **Database**: SQLite with Prisma ORM

### 6. Open Your Browser

Go to: `http://localhost:3000`

**That's it! Both frontend and backend are now running!**

## 🏗 Architecture Explanation

### **Next.js Full-Stack Architecture**
This POS application uses **Next.js 14 with App Router**, which combines frontend and backend in one application:

**Frontend Components:**
- React components in `src/components/`
- Pages in `src/app/`
- Tailwind CSS styling

**Backend API Routes:**
- `src/app/api/products/route.ts` - Product management
- `src/app/api/categories/route.ts` - Category management
- `src/app/api/orders/route.ts` - Order processing
- `src/app/api/orders/[id]/route.ts` - Individual order details

**Database:**
- SQLite database (`dev.db`)
- Prisma ORM for database operations
- Automatic migrations and seeding

### **How to Verify Everything is Working:**

1. **Frontend Check**: Visit `http://localhost:3000` - you should see the POS interface
2. **Backend API Check**: Visit these URLs in your browser:
   - `http://localhost:3000/api/products` - Should show JSON product data
   - `http://localhost:3000/api/categories` - Should show JSON category data
3. **Database Check**: Try adding items to cart and completing an order

## 📱 Usage

### Mobile View (390x844)
- Single column layout
- Products displayed vertically
- Cart section appears below products
- Touch-friendly buttons and controls

### Tablet View (768x1024)
- Two-column layout
- Products on the left, cart on the right
- Optimized for landscape orientation

### Core Functionality

1. **Browse Products**: Use category filters to find items
2. **Add to Cart**: Click "Add to Cart" on any product
3. **Manage Cart**: Adjust quantities or remove items
4. **Checkout**: Select payment method and complete order
5. **Receipt**: View, print, or download receipt

## 🗃 Database Schema

### Products
- ID, name, description, price
- Category association
- Stock tracking
- Image URL support

### Categories
- ID and name
- Product count tracking

### Orders
- Order details with tax calculation
- Payment method tracking
- Order items with quantities and prices

## 🎨 Sample Data

The application comes pre-loaded with Indonesian food and beverage items:

**Beverages**: Coffee, Tea, Orange Juice
**Food**: Nasi Goreng, Mie Ayam, Gado-Gado  
**Snacks**: Keripik Singkong, Kacang Goreng, Pisang Goreng

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset and reseed database

# Code Quality
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
pos-mamaku/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Sample data seeding
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Main POS interface
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── Cart.tsx     # Shopping cart
│   │   ├── ProductGrid.tsx
│   │   ├── CheckoutDialog.tsx
│   │   └── ReceiptDialog.tsx
│   ├── contexts/        # React contexts
│   │   └── CartContext.tsx
│   └── types/           # TypeScript definitions
├── .env                 # Environment variables
├── next.config.ts       # Next.js configuration
└── package.json         # Dependencies and scripts
```

## 🌐 API Endpoints

- `GET /api/products` - Fetch all products with categories
- `GET /api/categories` - Fetch all categories with product counts
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get specific order details

## 💡 Key Features Explained

### Tax Calculation
- Automatic 10% tax calculation on all orders
- Displayed separately in cart and receipts

### Payment Methods
- **Cash**: Traditional cash payment
- **Card**: Credit/debit card payment  
- **Mobile Payment**: Digital wallet/mobile payment

### Receipt System
- Professional receipt layout
- Order ID generation
- Indonesian date/time formatting
- Print and download functionality

### Responsive Design
- Mobile-first approach
- Breakpoint at 768px for tablet layout
- Touch-optimized interface elements

## 🔒 Production Deployment

For production deployment:

1. Update environment variables for production database
2. Configure image domains in `next.config.ts`
3. Set up proper database (PostgreSQL recommended)
4. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both mobile and tablet
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the console for error messages
2. Verify database connection and seeding
3. Ensure all dependencies are installed
4. Test on the specified device dimensions

---

**Built with ❤️ for modern POS systems**
