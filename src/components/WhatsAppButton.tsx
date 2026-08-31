"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { HOTEL_CONFIG } from "@/data/config";

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMessage = `¡Hola ${HOTEL_CONFIG.name}! Me gustaría consultar disponibilidad de habitaciones y tarifas para mi estadía en Quibdó.`;
  const whatsappUrl = `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex flex-col items-end gap-2 group pointer-events-none">
      {/* Dynamic Floating Tooltip - Oculto en pantallas pequeñas muy compactas si hay scroll */}
      {showTooltip && (
        <div className="relative glass-card border border-emerald-500/40 bg-dark-bg/95 backdrop-blur-xl text-white text-xs font-medium py-1.5 px-3 rounded-2xl shadow-xl shadow-black/80 flex items-center gap-2 animate-bounce max-w-[240px] sm:max-w-xs pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-white text-[11px] sm:text-xs">¿Viajas a Quibdó?</span>
            <span className="text-[10px] sm:text-[11px] text-neutral-gray">¡Atención por WhatsApp!</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            onTouchEnd={(e) => {
              e.preventDefault();
              setShowTooltip(false);
            }}
            className="text-neutral-gray hover:text-white transition-colors ml-1 p-1 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button with official label and logo */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Reservar por WhatsApp - Hotel Punto Aparte Quibdó"
        className="relative inline-flex items-center gap-2.5 px-3.5 sm:px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl shadow-emerald-950/80 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 pointer-events-auto touch-manipulation cursor-pointer"
      >
        {/* Glow Ring Pulse */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping -z-10 pointer-events-none" />

        {/* Official WhatsApp Logo SVG */}
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white shrink-0" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        <span className="font-bold text-xs sm:text-sm tracking-wide">
          Reservar por WhatsApp
        </span>
      </a>
    </div>
  );
}
