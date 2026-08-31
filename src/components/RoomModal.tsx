"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { X, Check, Users, Maximize, Bed, ShieldCheck, Sparkles, Snowflake, Wind, View, Camera, ShoppingBag } from "lucide-react";
import { Room } from "@/data/rooms";
import { useCart } from "@/context/CartContext";
import { HOTEL_CONFIG } from "@/data/config";

// Carga diferida optimizada del visor 3D WebGL (SSR desactivado)
const PanoramaViewer = dynamic(() => import("./PanoramaViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] sm:h-[460px] w-full flex flex-col items-center justify-center bg-white/5 rounded-2xl border border-gold-500/30 text-gold-400 gap-3">
      <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs uppercase tracking-wider font-semibold text-neutral-light">
        Cargando Visor 360° / WebGL...
      </span>
    </div>
  ),
});

interface RoomModalProps {
  room: Room | null;
  initial360?: boolean;
  onClose: () => void;
}

export default function RoomModal({ room, initial360 = false, onClose }: RoomModalProps) {
  const [show360, setShow360] = useState(initial360);
  const { addToCart } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (room) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
      setShow360(false);
    };
  }, [room, onClose]);

  if (!room) return null;

  const whatsappUrl = `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(
    room.whatsappMessage
  )}`;

  const panoramaSrc = room.panoramaImage || room.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card border border-gold-500/30 rounded-3xl shadow-2xl shadow-black text-neutral-light"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-dark-bg/80 border border-white/20 text-neutral-light hover:text-gold-400 hover:border-gold-500/50 transition-all"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Visual Area: Standard Image vs 360° Panorama */}
        <div className="relative w-full overflow-hidden rounded-t-3xl bg-dark-card">
          {show360 ? (
            <div className="p-3 sm:p-4">
              <PanoramaViewer
                src={panoramaSrc}
                caption={`Tour 360° - ${room.name}`}
                height="440px"
              />
            </div>
          ) : (
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <Image
                src={room.image}
                alt={room.name}
                fill
                priority
                quality={80}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />
            </div>
          )}

          {/* Floating Control Bar: Toggle 2D vs 360° Mode */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-400 text-xs tracking-wider uppercase font-semibold">
                  {room.category}
                </span>
                <span className="inline-block px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white text-xs font-medium">
                  {room.availableUnits} hab. disponibles
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-3xl font-bold text-neutral-light">
                {room.name}
              </h2>
            </div>

            {/* 360° Tour Button */}
            <button
              onClick={() => setShow360(!show360)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-card border border-gold-400/50 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 hover:text-white text-xs font-bold shadow-lg backdrop-blur-md transition-all hover:scale-105"
            >
              {show360 ? (
                <>
                  <Camera className="w-4 h-4 text-gold-400" />
                  <span>Ver Foto Estándar</span>
                </>
              ) : (
                <>
                  <View className="w-4 h-4 text-gold-400 animate-pulse" />
                  <span>Ver Tour 360° / 3D</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="flex flex-col items-center gap-1">
              <Users className="w-5 h-5 text-gold-400" />
              <span className="text-xs text-neutral-gray">Capacidad</span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-light">{room.capacity}</span>
            </div>

            <div className="flex flex-col items-center gap-1 border-l sm:border-x border-white/10">
              <Maximize className="w-5 h-5 text-gold-400" />
              <span className="text-xs text-neutral-gray">Superficie</span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-light">{room.size}</span>
            </div>

            <div className="flex flex-col items-center gap-1 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
              <Bed className="w-5 h-5 text-gold-400" />
              <span className="text-xs text-neutral-gray">Acomodación</span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-light">{room.bedType}</span>
            </div>

            <div className="flex flex-col items-center gap-1 border-l border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
              {room.climateControl === "ac" ? (
                <Snowflake className="w-5 h-5 text-sky-400" />
              ) : (
                <Wind className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-xs text-neutral-gray">Climatización</span>
              <span className="text-xs sm:text-sm font-semibold text-neutral-light">{room.climateLabel}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-heading text-xl font-semibold text-neutral-light mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              Descripción de la Habitación
            </h3>
            <p className="text-sm sm:text-base text-neutral-gray leading-relaxed font-light">
              {room.description}
            </p>
          </div>

          {/* Services & Amenities */}
          <div>
            <h3 className="font-heading text-xl font-semibold text-neutral-light mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
              Servicios y Equipamiento Incluido
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room.services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-neutral-light"
                >
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Highlights */}
          <div className="p-5 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gold-400 mb-2">
                Puntos Destacados
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-light/90">
                {room.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-6 shrink-0">
              <span className="text-xs text-neutral-gray block">Tarifa Oficial</span>
              <span className="text-2xl font-bold text-gold-gradient font-heading">
                {room.pricePerNight}
              </span>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                addToCart(room);
                onClose();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2.5 bg-gold-gradient text-dark-bg font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-gold-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5 text-dark-bg" />
              <span>Agregar al Carrito de Reserva</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Reservar WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl border border-white/15 text-neutral-gray hover:text-neutral-light hover:bg-white/5 transition-colors font-medium text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

