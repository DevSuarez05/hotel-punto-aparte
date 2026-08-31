"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Eye, Users, Maximize, Wifi, Tv, Check, Snowflake, Wind, View, ShoppingBag, Filter, CalendarCheck2, AlertTriangle } from "lucide-react";
import { roomsData, Room, TOTAL_HOTEL_ROOMS, RoomCategoryId } from "@/data/rooms";
import { useCart } from "@/context/CartContext";
import { HOTEL_CONFIG } from "@/data/config";
import { RoomAvailabilityResult } from "@/lib/inventory";

const RoomModal = dynamic(() => import("./RoomModal"), { ssr: false });

export default function RoomsSection() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [is360Mode, setIs360Mode] = useState(false);
  const [climateFilter, setClimateFilter] = useState<"all" | "ac" | "fan">("all");
  const [bedFilter, setBedFilter] = useState<"all" | "doble" | "sencilla">("all");
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, RoomAvailabilityResult>>({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const { checkIn, checkOut, guests, addToCart } = useCart();

  // Consultar disponibilidad en tiempo real para las fechas seleccionadas
  useEffect(() => {
    if (!checkIn || !checkOut) return;

    let isMounted = true;
    setIsLoadingAvailability(true);

    fetch(`/api/availability?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.roomsAvailability) {
          setAvailabilityMap(data.roomsAvailability);
        }
      })
      .catch((err) => console.error("Error al obtener disponibilidad:", err))
      .finally(() => {
        if (isMounted) setIsLoadingAvailability(false);
      });

    return () => {
      isMounted = false;
    };
  }, [checkIn, checkOut]);

  // Filtrar habitaciones por climatización, tipo de cama y capacidad
  const filteredRooms = roomsData.filter((room) => {
    if (climateFilter !== "all" && room.climateControl !== climateFilter) return false;
    if (bedFilter !== "all" && room.bedCategory !== bedFilter) return false;
    return true;
  });

  return (
    <section id="habitaciones" className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-bg relative z-10 scroll-mt-24">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="px-4 py-1.5 rounded-full glass-card border border-gold-500/40 text-xs font-bold uppercase tracking-widest text-gold-400 shadow-lg">
            Capacidad Instalada · {TOTAL_HOTEL_ROOMS} Habitaciones
          </span>

          {checkIn && checkOut && (
            <span className="px-4 py-1.5 rounded-full glass-card border border-emerald-500/40 text-xs font-bold uppercase tracking-widest text-emerald-300 shadow-lg flex items-center gap-1.5">
              <CalendarCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fechas: {checkIn} al {checkOut} ({guests} huésped{guests > 1 ? "es" : ""})</span>
            </span>
          )}
        </div>

        <h2 className="font-heading text-3xl sm:text-5xl font-bold text-neutral-light mb-6">
          Nuestras Tarifas & <span className="text-gold-gradient">Habitaciones Oficiales</span>
        </h2>
        <p className="text-base sm:text-lg text-neutral-gray max-w-2xl mx-auto font-light leading-relaxed">
          Elige la acomodación que mejor se adapte a tus necesidades de descanso y presupuesto. 
          Inventario monitoreado en tiempo real para evitar reservas duplicadas (anti-overbooking).
        </p>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
          <button
            onClick={() => {
              setClimateFilter("all");
              setBedFilter("all");
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              climateFilter === "all" && bedFilter === "all"
                ? "bg-gold-gradient text-dark-bg shadow-lg shadow-gold-500/20"
                : "glass-card border border-white/10 text-neutral-gray hover:text-white hover:border-gold-500/40"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Todas las Tarifas ({roomsData.length})</span>
          </button>

          {/* Climatización */}
          <button
            onClick={() => setClimateFilter(climateFilter === "ac" ? "all" : "ac")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              climateFilter === "ac"
                ? "bg-sky-500 text-dark-bg shadow-lg shadow-sky-500/30 font-extrabold"
                : "glass-card border border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Aire Acondicionado (13)</span>
          </button>

          <button
            onClick={() => setClimateFilter(climateFilter === "fan" ? "all" : "fan")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              climateFilter === "fan"
                ? "bg-amber-500 text-dark-bg shadow-lg shadow-amber-500/30 font-extrabold"
                : "glass-card border border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Ventilador (10)</span>
          </button>

          {/* Tipo de Cama */}
          <button
            onClick={() => setBedFilter(bedFilter === "doble" ? "all" : "doble")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              bedFilter === "doble"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 font-extrabold"
                : "glass-card border border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            }`}
          >
            <span>Cama Doble (8)</span>
          </button>

          <button
            onClick={() => setBedFilter(bedFilter === "sencilla" ? "all" : "sencilla")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              bedFilter === "sencilla"
                ? "bg-emerald-500 text-dark-bg shadow-lg shadow-emerald-500/30 font-extrabold"
                : "glass-card border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            }`}
          >
            <span>Cama Sencilla (15)</span>
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredRooms.map((room, index) => {
          const availabilityInfo = availabilityMap[room.id];
          const availableUnits = availabilityInfo ? availabilityInfo.availableUnits : room.availableUnits;
          const isSoldOut = availabilityInfo ? availabilityInfo.isSoldOut : availableUnits <= 0;

          const whatsappUrl = `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(
            room.whatsappMessage
          )}`;

          return (
            <div
              key={room.id}
              className={`glass-card glass-card-hover rounded-3xl overflow-hidden border flex flex-col justify-between group shadow-xl shadow-black/40 ${
                isSoldOut ? "border-red-500/40 opacity-90" : "border-white/10"
              }`}
            >
              {/* Room Image Container */}
              <div className="relative h-72 w-full overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  priority={index === 0}
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover object-center transform-gpu transition-transform duration-700 ${
                    isSoldOut ? "grayscale-[40%]" : "group-hover:scale-110"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-80" />

                {/* Badge Category & Real-time Stock */}
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-dark-bg/90 backdrop-blur-md border border-gold-500/40 text-gold-400 text-xs font-semibold uppercase tracking-wider shadow-md">
                    {room.category}
                  </span>

                  {isSoldOut ? (
                    <span className="px-3 py-1.5 rounded-full bg-red-950/90 border border-red-500/60 text-red-300 text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span>Agotada para estas fechas</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold shadow-md flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{availableUnits} hab. disponible{availableUnits > 1 ? "s" : ""}</span>
                    </span>
                  )}
                </div>

                {/* Climate Badge Top Right */}
                <div className="absolute top-4 right-4 z-10">
                  {room.climateControl === "ac" ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-950/90 border border-sky-400/50 text-sky-300 text-xs font-semibold backdrop-blur-md shadow-lg">
                      <Snowflake className="w-4 h-4 text-sky-400" />
                      <span>Aire Acondicionado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-950/90 border border-amber-400/50 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg">
                      <Wind className="w-4 h-4 text-amber-400" />
                      <span>Ventilador</span>
                    </span>
                  )}
                </div>

                {/* Glassmorphism 360° Tour Button Overlay (Bottom Left) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIs360Mode(true);
                    setSelectedRoom(room);
                  }}
                  className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/75 hover:bg-black/90 backdrop-blur-md border border-gold-400/50 text-gold-300 hover:text-white text-xs font-bold shadow-xl transition-all hover:scale-105"
                  title="Abrir Tour Interactivo 360°"
                >
                  <View className="w-4 h-4 text-gold-400 animate-pulse" />
                  <span>Ver en 360°</span>
                </button>

                {/* Price Tag (Bottom Right) */}
                <div className="absolute bottom-4 right-4 z-10 bg-dark-bg/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
                  <span className="text-[10px] text-neutral-gray block uppercase font-medium">Tarifa por noche</span>
                  <span className="text-xl sm:text-2xl font-bold text-gold-gradient font-heading">
                    {room.pricePerNight}
                  </span>
                </div>
              </div>

              {/* Room Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-neutral-light mb-2 group-hover:text-gold-300 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-gray font-light line-clamp-2 leading-relaxed mb-4">
                    {room.tagline}
                  </p>

                  {/* Specs Quick Strip */}
                  <div className="flex items-center gap-4 py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-light/90 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gold-400" />
                      <span>{room.capacity}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5">
                      <Maximize className="w-4 h-4 text-gold-400" />
                      <span>{room.size}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5">
                      <span>{room.bedType}</span>
                    </div>
                  </div>

                  {/* Top Amenities Pills */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-gray">
                    {room.climateControl === "ac" ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-300">
                        <Snowflake className="w-3 h-3 text-sky-400" /> A/C Climatizado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300">
                        <Wind className="w-3 h-3 text-amber-400" /> Ventilador Potente
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                      <Wifi className="w-3 h-3 text-gold-400" /> Wi-Fi
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                      <Tv className="w-3 h-3 text-gold-400" /> Smart TV
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                      <Check className="w-3 h-3 text-gold-400" /> Baño Privado
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/10">
                  <button
                    disabled={isSoldOut}
                    onClick={() => {
                      if (!isSoldOut) addToCart(room);
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                      isSoldOut
                        ? "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                        : "bg-gold-gradient text-dark-bg hover:shadow-lg hover:shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isSoldOut ? "Agotada para estas fechas" : "Reservar / Carrito"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIs360Mode(false);
                      setSelectedRoom(room);
                    }}
                    className="py-3 px-3.5 rounded-xl border border-white/20 hover:border-gold-500/50 bg-white/5 hover:bg-white/10 text-neutral-light text-xs font-semibold transition-all"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4 text-gold-400" />
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-md shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all"
                    title={`Consultar por WhatsApp`}
                  >
                    <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Details Modal */}
      <RoomModal
        key={selectedRoom ? `${selectedRoom.id}-${is360Mode}` : "modal-none"}
        room={selectedRoom}
        initial360={is360Mode}
        onClose={() => {
          setSelectedRoom(null);
          setIs360Mode(false);
        }}
      />
    </section>
  );
}
