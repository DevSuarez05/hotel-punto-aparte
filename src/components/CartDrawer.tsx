"use client";

import { useEffect } from "react";
import Image from "next/image";
import {
  X,
  ShoppingCart,
  Trash2,
  Calendar,
  Users,
  ChevronRight,
  Plus,
  Minus,
  Snowflake,
  Wind,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/data/rooms";

export default function CartDrawer() {
  const {
    items,
    checkIn,
    checkOut,
    guests,
    setDates,
    removeFromCart,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    totalNights,
    totalAmount,
    itemCount,
  } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCartOpen(false);
    };

    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div
        className="fixed inset-0"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full bg-dark-bg/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col justify-between z-10 text-neutral-light">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
                Carrito de Reserva
              </h2>
              <span className="text-xs text-neutral-gray font-light">
                {itemCount} {itemCount === 1 ? "habitación" : "habitaciones"} en tu selección
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-gray hover:text-white hover:border-gold-500/40 transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector Banner */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-gold-400 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Fechas de Estancia ({totalNights} {totalNights === 1 ? "noche" : "noches"})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-dark-bg/80 p-2.5 rounded-xl border border-white/10">
              <label className="text-[10px] text-neutral-gray uppercase block mb-1">Entrada</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setDates(e.target.value, checkOut, guests)}
                className="bg-transparent text-white font-medium focus:outline-none w-full [color-scheme:dark]"
              />
            </div>

            <div className="bg-dark-bg/80 p-2.5 rounded-xl border border-white/10">
              <label className="text-[10px] text-neutral-gray uppercase block mb-1">Salida</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setDates(checkIn, e.target.value, guests)}
                className="bg-transparent text-white font-medium focus:outline-none w-full [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Body Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-gray">
                <ShoppingCart className="w-8 h-8 text-neutral-gray/50" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white">
                Tu carrito está vacío
              </h3>
              <p className="text-xs text-neutral-gray font-light max-w-xs">
                Explora nuestras habitaciones y selecciona la mejor opción para tu viaje a Quibdó.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setTimeout(() => {
                    const element = document.getElementById("habitaciones");
                    if (element) {
                      const yOffset = -80;
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    } else {
                      window.location.hash = "habitaciones";
                    }
                  }, 150);
                }}
                className="mt-2 px-6 py-3 rounded-xl bg-gold-gradient text-dark-bg font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold-500/20 cursor-pointer flex items-center gap-2"
              >
                <span>Ver Habitaciones</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.room.id}
                className="glass-card p-4 rounded-2xl border border-white/10 flex gap-4 items-start relative group"
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={item.room.image}
                    alt={item.room.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold text-gold-400 truncate">
                      {item.room.category}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.room.id)}
                      className="text-neutral-gray hover:text-red-400 p-1 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-heading text-sm font-bold text-white truncate">
                    {item.room.name}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-gray">
                    {item.room.climateControl === "ac" ? (
                      <span className="flex items-center gap-1 text-sky-400">
                        <Snowflake className="w-3 h-3" /> A/C
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Wind className="w-3 h-3" /> Ventilador
                      </span>
                    )}
                    <span>·</span>
                    <span>{item.nights} {item.nights === 1 ? "noche" : "noches"}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.room.id, item.quantity - 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-neutral-gray hover:text-white hover:bg-white/10"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-1 text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.room.id, item.quantity + 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-neutral-gray hover:text-white hover:bg-white/10"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Total Price */}
                    <span className="text-sm font-bold text-gold-gradient font-heading">
                      {formatCOP(item.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-dark-surface/80 space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-gray">
                <span>Total de Noches:</span>
                <span className="text-white font-medium">{totalNights}</span>
              </div>
              <div className="flex justify-between text-neutral-gray">
                <span>Impuestos & Tasas:</span>
                <span className="text-emerald-400 font-medium">Incluidos</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                <span>Total General:</span>
                <span className="text-gold-gradient font-heading text-lg">
                  {formatCOP(totalAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-gold-gradient text-dark-bg font-bold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-gold-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <span>Proceder al Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-neutral-gray font-light flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-gold-400" />
              Reserva 100% garantida con confirmación inmediata
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
