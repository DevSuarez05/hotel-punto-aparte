"use client";

import { MapPin, Phone, Compass, ExternalLink, Navigation, Landmark, Building2, ShoppingBag } from "lucide-react";

export default function LocationMap() {
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Calle+26+No.+5+-+37+Quibdo+Choco+Pasaje+Alameda+Reyes";

  const nearbyLandmarks = [
    {
      icon: ShoppingBag,
      title: "Zona Comercial y Bancaria",
      distance: "A 50 metros (Pasaje Alameda Reyes)",
    },
    {
      icon: Landmark,
      title: "Catedral San Francisco de Asís",
      distance: "A 3 minutos a pie",
    },
    {
      icon: Navigation,
      title: "Malecón de Quibdó & Río Atrato",
      distance: "A 5 minutos caminando",
    },
    {
      icon: Building2,
      title: "Gobernación del Chocó & Centro Cívico",
      distance: "A 4 minutos de distancia",
    },
  ];

  return (
    <section id="ubicacion" className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-bg relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-orange-brand/30 text-xs tracking-widest uppercase text-gold-400 mb-4">
            <Compass className="w-3.5 h-3.5 text-orange-brand" />
            Localización Privilegiada
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white mb-6">
            Ubicación <span className="text-gold-gradient">Estratégica en Quibdó</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-gray max-w-2xl mx-auto font-light leading-relaxed">
            Situado en el corazón comercial y cultural de la ciudad, facilitando tus desplazamientos corporativos y turísticos.
          </p>
        </div>

        {/* 2-Column Divided Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Info Card */}
          <div className="lg:col-span-5 glass-card p-8 rounded-3xl border border-white/10 flex flex-col justify-between space-y-8 shadow-2xl shadow-black/60">
            <div className="space-y-6">
              {/* Address Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-brand/10 border border-orange-brand/30 flex items-center justify-center text-orange-brand shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold block mb-1">
                    Dirección Oficial
                  </span>
                  <p className="text-base font-bold text-white leading-snug">
                    Calle 26 No. 5 - 37 <br />
                    <span className="text-gold-400 font-normal">entre Cra. 5 y 6</span>
                  </p>
                  <p className="text-xs text-neutral-gray mt-1 font-light">
                    Pasaje peatonal Alameda Reyes — Quibdó, Chocó.
                  </p>
                </div>
              </div>

              {/* Phones Block */}
              <div className="flex items-start gap-4 border-t border-white/10 pt-6">
                <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold block mb-1">
                    Teléfonos de Atención
                  </span>
                  <p className="text-base font-bold text-white font-heading">
                    +57 313 291 2088
                  </p>
                  <p className="text-xs text-neutral-gray mt-0.5">
                    Teléfono Fijo: (604) 671 2525
                  </p>
                </div>
              </div>

              {/* Nearby Landmarks List */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-white">
                  Puntos de Interés Cercanos
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {nearbyLandmarks.map((landmark, idx) => {
                    const IconComponent = landmark.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-neutral-gray hover:border-gold-500/30 hover:text-white transition-colors"
                      >
                        <div className="w-8 h-8 rounded-xl bg-dark-bg border border-white/10 flex items-center justify-center text-gold-400 shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{landmark.title}</span>
                          <span className="text-[11px] text-neutral-gray">{landmark.distance}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Google Maps CTA Button */}
            <div className="pt-4 border-t border-white/10">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-gold-gradient text-dark-bg font-bold py-3.5 px-6 rounded-2xl hover:shadow-lg hover:shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm tracking-wide"
              >
                <span>Cómo llegar (Abrir en Google Maps)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Embedded Interactive Google Map */}
          <div className="lg:col-span-7 glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/70 min-h-[400px] lg:min-h-[550px] relative group flex flex-col">
            {/* Embedded Iframe */}
            <iframe
              title="Mapa interactivo de ubicación Hotel Punto Aparte Quibdó"
              src="https://maps.google.com/maps?q=Calle%2026%20No.%205%20-%2037%20Quibdo%20Choco&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: "grayscale(100%) invert(92%) contrast(83%)",
              }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full flex-1 min-h-[400px] lg:min-h-[550px] transition-all duration-500 group-hover:filter-none"
            />

            {/* Overlay Badge Header */}
            <div className="absolute top-6 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
              <div className="glass-card border border-gold-500/40 px-4 py-2.5 rounded-2xl backdrop-blur-xl shadow-xl pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-brand animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    Pasaje Peatonal Alameda Reyes
                  </span>
                </div>
                <span className="text-[10px] text-gold-400 block mt-0.5 font-medium">
                  Centro Administrativo y Comercial de Quibdó
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
