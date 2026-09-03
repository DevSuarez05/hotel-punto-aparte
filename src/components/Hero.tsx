"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar as CalendarIcon, Users, Search, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCart, getDefaultDates } from "@/context/CartContext";
import { HOTEL_CONFIG } from "@/data/config";

export default function Hero() {
  const { checkIn: contextCheckIn, checkOut: contextCheckOut, guests: contextGuests, setDates } = useCart();

  const [localCheckIn, setLocalCheckIn] = useState<string>("");
  const [localCheckOut, setLocalCheckOut] = useState<string>("");
  const [localGuests, setLocalGuests] = useState<string>(String(contextGuests || 2));
  const [isSearching, setIsSearching] = useState(false);

  // Hidratar las fechas de Hoy y Mañana por defecto en el cliente
  useEffect(() => {
    const defaults = getDefaultDates();
    setLocalCheckIn(contextCheckIn || defaults.checkIn);
    setLocalCheckOut(contextCheckOut || defaults.checkOut);
    if (contextGuests) setLocalGuests(String(contextGuests));
  }, [contextCheckIn, contextCheckOut, contextGuests]);

  const executeSearch = () => {
    setIsSearching(true);

    const defaults = getDefaultDates();
    const finalCheckIn = localCheckIn || defaults.checkIn;
    const finalCheckOut = localCheckOut || defaults.checkOut;

    // Asignar fallback si alguna fecha está vacía
    if (!localCheckIn) setLocalCheckIn(finalCheckIn);
    if (!localCheckOut) setLocalCheckOut(finalCheckOut);

    // Guardar en contexto global del carrito y localStorage
    setDates(finalCheckIn, finalCheckOut, Number(localGuests));

    toast.success("Disponibilidad Actualizada", {
      description: `Buscando habitaciones para ${localGuests} huésped(es) del ${finalCheckIn} al ${finalCheckOut}.`,
    });

    // Desplazamiento automático garantizado con setTimeout 100ms
    setTimeout(() => {
      const element = document.getElementById("habitaciones");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        // Fallback de cálculo de posición exacta considerando el header pegajoso
        const yOffset = -90;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      } else {
        window.location.hash = "habitaciones";
      }
      setIsSearching(false);
    }, 100);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <section id="inicio" className="relative min-h-[90vh] flex flex-col justify-between pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-dark-bg">
      {/* Background Image with Next/Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/assets/images/hotel/recepcion-oficial-hotel.jpg"
          alt="Lobby y Recepción Real de Hotel Punto Aparte Quibdó"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center scale-105 transform-gpu transition-transform duration-1000"
        />
        {/* Dark Overlay Layer for 100% Text Readability */}
        <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-dark-bg via-black/70 to-dark-bg/60" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mt-8 sm:mt-16 mb-12">
        {/* Location & Distinction Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-orange-brand/30 text-xs sm:text-sm tracking-wider uppercase text-neutral-light shadow-lg shadow-black/50">
            <MapPin className="w-4 h-4 text-orange-brand" />
            <span>Quibdó · Chocó, Colombia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-brand animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-emerald-500/30 text-xs sm:text-sm tracking-wider uppercase text-emerald-300 shadow-lg shadow-black/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{HOTEL_CONFIG.antiSeismic.short}</span>
          </div>
        </div>

        {/* Impactful Title */}
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-light leading-[1.15] mb-6">
          Hotel Punto Aparte <br />
          <span className="text-gold-gradient">
            Tu espacio de desconexión
          </span>{" "}
          en el corazón de Quibdó
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-gray max-w-3xl mx-auto font-light leading-relaxed mb-10">
          Disfruta de una experiencia exclusiva donde el confort contemporáneo, 
          la seguridad de nuestra edificación antisísmica y la calidez chocoana se unen para brindarte un descanso inolvidable.
        </p>
      </div>

      {/* Módulo de Búsqueda Flotante con Z-Index 40 Elevado */}
      <div id="reservar" className="relative z-40 max-w-5xl mx-auto w-full scroll-mt-28">
        <div id="buscador" className="glass-card border border-white/15 p-4 sm:p-6 rounded-2xl md:rounded-full shadow-2xl shadow-black/90 backdrop-blur-xl scroll-mt-28">
          <form
            onSubmit={handleFormSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center"
          >
            {/* Check-In Field */}
            <div className="flex flex-col px-4 py-2.5 rounded-xl md:rounded-l-full bg-white/5 border border-white/10 hover:border-gold-500/40 transition-colors">
              <label className="text-[11px] font-medium tracking-wider uppercase text-gold-400 flex items-center gap-1.5 mb-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Fecha de entrada
              </label>
              <input
                type="date"
                required
                value={localCheckIn}
                onChange={(e) => setLocalCheckIn(e.target.value)}
                className="bg-transparent text-sm text-neutral-light font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* Check-Out Field */}
            <div className="flex flex-col px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/40 transition-colors">
              <label className="text-[11px] font-medium tracking-wider uppercase text-gold-400 flex items-center gap-1.5 mb-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Fecha de salida
              </label>
              <input
                type="date"
                required
                value={localCheckOut}
                onChange={(e) => setLocalCheckOut(e.target.value)}
                className="bg-transparent text-sm text-neutral-light font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* Selector de Huéspedes con Estilos Oscuros en <option> (bg-zinc-900 text-white) */}
            <div className="flex flex-col px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/40 transition-colors">
              <label className="text-[11px] font-medium tracking-wider uppercase text-gold-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5" />
                Huéspedes
              </label>
              <select
                value={localGuests}
                onChange={(e) => setLocalGuests(e.target.value)}
                className="bg-transparent text-sm text-neutral-light font-medium focus:outline-none cursor-pointer bg-dark-bg"
              >
                <option value="1" className="bg-zinc-900 text-white font-medium py-2">
                  1 Huésped (Individual)
                </option>
                <option value="2" className="bg-zinc-900 text-white font-medium py-2">
                  2 Huéspedes (Pareja/Doble)
                </option>
                <option value="3" className="bg-zinc-900 text-white font-medium py-2">
                  3 Huéspedes (Familiar)
                </option>
                <option value="4" className="bg-zinc-900 text-white font-medium py-2">
                  4+ Huéspedes (Suite)
                </option>
              </select>
            </div>

            {/* Botón Consultar con evento onClick directo y scroll suave garantizado a #habitaciones */}
            <button
              type="button"
              disabled={isSearching}
              onClick={() => executeSearch()}
              onTouchEnd={(e) => {
                e.preventDefault();
                executeSearch();
              }}
              className="w-full h-full min-h-[52px] bg-gold-gradient text-dark-bg font-bold rounded-xl md:rounded-r-full hover:shadow-lg hover:shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer relative z-30 touch-manipulation"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Consultar</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
