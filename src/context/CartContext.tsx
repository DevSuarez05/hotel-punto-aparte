"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Room } from "@/data/rooms";
import { toast } from "sonner";

export interface CartItem {
  room: Room;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  quantity: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  checkIn: string;
  checkOut: string;
  guests: number;
  setDates: (checkIn: string, checkOut: string, guests?: number) => void;
  addToCart: (
    room: Room,
    customCheckIn?: string,
    customCheckOut?: string,
    customGuests?: number
  ) => void;
  removeFromCart: (roomId: string) => void;
  updateQuantity: (roomId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  totalNights: number;
  totalAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const calculateNights = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 1;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

export const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const format = (d: Date) => d.toISOString().split("T")[0];
  return {
    checkIn: format(today),
    checkOut: format(tomorrow),
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize with empty strings to avoid hydration mismatch (server vs client dates)
  const [checkIn, setCheckInState] = useState<string>("");
  const [checkOut, setCheckOutState] = useState<string>("");
  const [guests, setGuestsState] = useState<number>(2);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate dates and cart from client only (prevents SSR/CSR date mismatch)
  useEffect(() => {
    const defaults = getDefaultDates();
    setCheckInState(defaults.checkIn);
    setCheckOutState(defaults.checkOut);

    try {
      const savedCart = localStorage.getItem("hotel_punto_aparte_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error("Error loading cart from localStorage", e);
    }

    setIsHydrated(true);
  }, []);

  // Save cart to localStorage on updates
  useEffect(() => {
    try {
      localStorage.setItem("hotel_punto_aparte_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  }, [items]);

  const setDates = (newIn: string, newOut: string, newGuests?: number) => {
    if (newIn) setCheckInState(newIn);
    if (newOut) setCheckOutState(newOut);
    if (newGuests) setGuestsState(newGuests);

    // Update dates for existing cart items
    setItems((prevItems) =>
      prevItems.map((item) => {
        const cIn = newIn || item.checkIn;
        const cOut = newOut || item.checkOut;
        const nights = calculateNights(cIn, cOut);
        return {
          ...item,
          checkIn: cIn,
          checkOut: cOut,
          nights,
          totalPrice: item.room.priceNumeric * nights * item.quantity,
        };
      })
    );
  };

  const addToCart = (
    room: Room,
    customCheckIn?: string,
    customCheckOut?: string,
    customGuests?: number
  ) => {
    const cIn = customCheckIn || checkIn;
    const cOut = customCheckOut || checkOut;
    const g = customGuests || guests;
    const nights = calculateNights(cIn, cOut);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.room.id === room.id
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentItem = updated[existingIndex];
        const newQty = Math.min(currentItem.quantity + 1, room.availableUnits);
        updated[existingIndex] = {
          ...currentItem,
          checkIn: cIn,
          checkOut: cOut,
          nights,
          quantity: newQty,
          totalPrice: room.priceNumeric * nights * newQty,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            room,
            checkIn: cIn,
            checkOut: cOut,
            nights,
            guests: g,
            quantity: 1,
            totalPrice: room.priceNumeric * nights * 1,
          },
        ];
      }
    });

    toast.success("¡Habitación añadida al carrito!", {
      description: `${room.name} (${nights} noche${nights > 1 ? "s" : ""}).`,
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (roomId: string) => {
    setItems((prev) => prev.filter((item) => item.room.id !== roomId));
    toast.info("Habitación removida del carrito");
  };

  const updateQuantity = (roomId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(roomId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.room.id === roomId) {
          const validQty = Math.min(quantity, item.room.availableUnits);
          return {
            ...item,
            quantity: validQty,
            totalPrice: item.room.priceNumeric * item.nights * validQty,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalNights = calculateNights(checkIn, checkOut);

  const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        checkIn,
        checkOut,
        guests,
        setDates,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        totalNights,
        totalAmount,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};
