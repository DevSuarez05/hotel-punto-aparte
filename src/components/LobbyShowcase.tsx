"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, ShieldCheck, Clock, HeartHandshake, Info, Maximize2, X, ChevronRight, LucideIcon, Tv, Wifi, Armchair, Coffee } from "lucide-react";
import { HOTEL_CONFIG } from "@/data/config";

interface Hotspot {
  id: number;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
}

export default function LobbyShowcase() {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);

  const hotspots: Hotspot[] = [
    {
      id: 1,
      x: 38,
      y: 60,
      title: "Sala de Estar & Sala Lounge",
      subtitle: "Confort & Descanso",
      description:
        "Espacio equipado con sofás confortables y mesa de centro para relajarte, recibir visitas o esperar tu check-in cómodamente.",
      icon: Armchair,
    },
    {
      id: 2,
      x: 62,
      y: 35,
      title: "Smart TV & Entretenimiento",
      subtitle: "Información & Noticias",
      description:
        "Pantalla Smart TV con canales y contenido multimedia disponible en el hall para el disfrute de todos los huéspedes.",
      icon: Tv,
    },
    {
      id: 3,
      x: 78,
      y: 65,
      title: "Zona Wi-Fi de Alta Velocidad",
      subtitle: "Conectividad Total",
      description:
        "Internet inalámbrico de alta velocidad en todas las áreas comunes del hotel para trabajar o comunicarte sin interrupciones.",
      icon: Wifi,
    },
    {
      id: 4,
      x: 20,
      y: 30,
      title: "Ambiente Climatizado & Acogedor",
      subtitle: "Calidez Chocoana",
      description:
        "Diseño fresco y ventilado con detalles en madera natural que brindan una atmósfera de desconexión en pleno centro de Quibdó.",
      icon: Coffee,
    },
  ];

  return (
    <section id="lobby" className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-bg relative z-10 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-brand/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-gold-500/40 text-xs tracking-widest uppercase text-gold-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Zonas Comunes & Hall
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white mb-6">
            Nuestro <span className="text-gold-gradient">Lobby & Sala de Estar Real</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-gray max-w-3xl mx-auto font-light leading-relaxed">
            Toca o pasa el cursor sobre los puntos dorados de la foto original para explorar la comodidad y servicios de nuestro lobby principal.
          </p>
        </div>

        {/* Main Interactive Showcase Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Hotspot Image */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden glass-card border border-white/15 shadow-2xl shadow-black/80 group">
            {/* Real User Lobby Photo */}
            <div className="relative w-full h-[380px] sm:h-[500px] lg:h-[540px]">
              <Image
                src="/assets/images/hotel/lobby-zona-estar.jpg"
                alt="Lobby y sala de estar real de Hotel Punto Aparte Quibdó con detalles interactivos"
                fill
                priority
                quality={85}
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
              />

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-dark-bg/30 pointer-events-none" />

              {/* Interactive Hotspot Pins */}
              {hotspots.map((spot) => (
                <div
                  key={spot.id}
                  style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                >
                  <button
                    onClick={() => setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)}
                    onMouseEnter={() => setActiveHotspot(spot)}
                    className={`relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                      activeHotspot?.id === spot.id
                        ? "bg-orange-brand text-white scale-125 shadow-lg shadow-orange-brand/50 ring-4 ring-white/40"
                        : "bg-dark-bg/90 border border-gold-400/80 text-gold-400 hover:scale-110 hover:bg-gold-500 hover:text-dark-bg shadow-xl"
                    }`}
                    aria-label={`Ver información sobre ${spot.title}`}
                  >
                    {/* Ping Outer Ring */}
                    <span className="absolute inset-0 rounded-full bg-gold-400/40 animate-ping pointer-events-none" />
                    <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ))}

              {/* Top Corner Badge */}
              <div className="absolute top-4 left-4 z-10 glass-card border border-gold-500/40 px-4 py-2 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Fotografía Real del Lobby</span>
                </div>
              </div>

              {/* Expand Fullscreen Button */}
              <button
                onClick={() => setIsFullModalOpen(true)}
                className="absolute top-4 right-4 z-10 p-3 rounded-2xl glass-card border border-white/20 text-white hover:text-gold-400 hover:border-gold-500 transition-all shadow-lg cursor-pointer"
                aria-label="Ver imagen ampliada"
                title="Ampliar vista"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Hotspot Info & Feature Badges */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Hotspot Info Card or Default Card */}
            <div className="glass-card p-7 rounded-3xl border border-gold-500/30 shadow-xl shadow-black/60 relative overflow-hidden transition-all duration-300 min-h-[260px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

              {activeHotspot ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-brand/20 border border-orange-brand/40 flex items-center justify-center text-orange-brand shrink-0">
                      {<activeHotspot.icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-gold-400 font-bold block">
                        {activeHotspot.subtitle}
                      </span>
                      <h3 className="font-heading text-lg font-bold text-white">
                        {activeHotspot.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-gray leading-relaxed font-light">
                    {activeHotspot.description}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-2">
                    <Info className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    Puntos Destacados del Lobby
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-gray leading-relaxed font-light">
                    Toca cualquiera de los 4 puntos dorados sobre la foto del lobby para conocer los detalles de comodidad, entretenimiento y atención en nuestro hall principal.
                  </p>
                </div>
              )}

              {/* Action Link to WhatsApp Reservation */}
              <div className="pt-4 border-t border-white/10 mt-4">
                <a
                  href={`https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent("¡Hola Hotel Punto Aparte! Quisiera consultar disponibilidad y resolver unas dudas sobre mi llegada a Quibdó.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between text-xs font-bold text-gold-400 hover:text-white transition-colors"
                >
                  <span>¿Dudas sobre tu llegada? Escríbenos por WhatsApp</span>
                  <ChevronRight className="w-4 h-4 text-orange-brand" />
                </a>
              </div>
            </div>

            {/* Quick Feature Badges Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white block">Recepción 24h</span>
                  <span className="text-[9px] text-neutral-gray">Atención permanente</span>
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-brand/10 border border-orange-brand/30 flex items-center justify-center text-orange-brand shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white block">Custodia Segura</span>
                  <span className="text-[9px] text-neutral-gray">Equipaje resguardado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Resolution View */}
      {isFullModalOpen && (
        <div
          onClick={() => setIsFullModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] glass-card border border-gold-500/40 rounded-3xl overflow-hidden p-3 shadow-2xl flex flex-col items-center"
          >
            <button
              onClick={() => setIsFullModalOpen(false)}
              className="absolute top-4 right-4 z-30 p-3 rounded-full bg-dark-bg/80 border border-white/20 text-white hover:text-gold-400 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-[65vh] sm:h-[75vh] rounded-2xl overflow-hidden">
              <Image
                src="/assets/images/hotel/lobby-zona-estar.jpg"
                alt="Lobby y Sala de Estar Hotel Punto Aparte Quibdó"
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
                className="object-contain object-center"
              />
            </div>
            <div className="text-center py-3">
              <span className="text-xs uppercase font-bold text-gold-400 tracking-wider">
                Lobby & Sala de Estar para Huéspedes
              </span>
              <p className="text-sm text-neutral-gray font-light mt-0.5">
                Calle 26 No. 5 - 37, Pasaje Peatonal Alameda Reyes — Quibdó, Chocó.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
