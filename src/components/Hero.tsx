"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar as CalendarIcon, Users, Search, MapPin, Sparkles } from "lucide-react";

export default function Hero() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      alert(
        `Buscando disponibilidad para ${guests} huésped(es) del ${checkIn || "hoy"} al ${checkOut || "mañana"}.`
      );
    }, 600);
  };

  return (
    <section id="inicio" className="relative min-h-[90vh] flex flex-col justify-between pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-dark-bg">
      {/* Background Image with Next/Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/hotel_fachada.jpeg"
          alt="Fachada real de Hotel Punto Aparte Quibdó"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 animate-fade-in duration-1000"
        />
        {/* Dark Overlay Layer for 100% Text Readability */}
        <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-dark-bg via-black/70 to-dark-bg/60" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mt-8 sm:mt-16 mb-12">
        {/* Location & Distinction Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-orange-brand/30 text-xs sm:text-sm tracking-wider uppercase text-neutral-light mb-6 shadow-lg shadow-black/50">
          <MapPin className="w-4 h-4 text-orange-brand" />
          <span>Quibdó · Chocó, Colombia</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-brand animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
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
          la privacidad absoluta y la calidez chocoana se unen para brindarle a tu 
          estancia un descanso inolvidable.
        </p>
      </div>

      {/* Floating Availability Search Module */}
      <div className="relative z-20 max-w-5xl mx-auto w-full">
        <div className="glass-card border border-white/15 p-4 sm:p-6 rounded-2xl md:rounded-full shadow-2xl shadow-black/90 backdrop-blur-xl">
          <form
            onSubmit={handleSearch}
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
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
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
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-sm text-neutral-light font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>

            {/* Guests Selector */}
            <div className="flex flex-col px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-gold-500/40 transition-colors">
              <label className="text-[11px] font-medium tracking-wider uppercase text-gold-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5" />
                Huéspedes
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-transparent text-sm text-neutral-light font-medium focus:outline-none cursor-pointer bg-dark-bg"
              >
                <option value="1">1 Huésped (Individual)</option>
                <option value="2">2 Huéspedes (Pareja/Doble)</option>
                <option value="3">3 Huéspedes (Familiar)</option>
                <option value="4">4+ Huéspedes (Suite)</option>
              </select>
            </div>

            {/* Consult Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="w-full h-full min-h-[52px] bg-gold-gradient text-dark-bg font-bold rounded-xl md:rounded-r-full hover:shadow-lg hover:shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
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
