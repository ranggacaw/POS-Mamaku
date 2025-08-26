'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  total: number
  subtotal: number
  tax: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

interface CartContextType {
  state: CartState
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const TAX_RATE = 0.1 // 10% tax

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      )

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [
          ...state.items,
          {
            id: action.payload.id,
            product: action.payload,
            quantity: 1,
          },
        ]
      }

      const subtotal = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )
      const tax = subtotal * TAX_RATE
      const total = subtotal + tax

      return {
        items: newItems,
        subtotal,
        tax,
        total,
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const subtotal = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )
      const tax = subtotal * TAX_RATE
      const total = subtotal + tax

      return {
        items: newItems,
        subtotal,
        tax,
        total,
      }
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter((item) => item.quantity > 0)

      const subtotal = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )
      const tax = subtotal * TAX_RATE
      const total = subtotal + tax

      return {
        items: newItems,
        subtotal,
        tax,
        total,
      }
    }

    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
        subtotal: 0,
        tax: 0,
      }

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  subtotal: 0,
  tax: 0,
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}