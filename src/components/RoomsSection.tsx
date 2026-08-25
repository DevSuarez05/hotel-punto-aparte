"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle, Eye, Users, Maximize, Wifi, Tv, Wind, Check } from "lucide-react";
import { roomsData, Room } from "@/data/rooms";
import RoomModal from "./RoomModal";

export default function RoomsSection() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <section id="habitaciones" className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-bg relative z-10">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full glass-card border border-gold-500/30 text-xs tracking-widest uppercase text-gold-400 mb-4">
          Nuestras Suites & Habitaciones
        </span>
        <h2 className="font-heading text-3xl sm:text-5xl font-bold text-neutral-light mb-6">
          Espacios diseñados para tu <span className="text-gold-gradient">máximo confort</span>
        </h2>
        <p className="text-base sm:text-lg text-neutral-gray max-w-2xl mx-auto font-light leading-relaxed">
          Cada habitación en Hotel Punto Aparte está pensada para ofrecer una atmósfera de elegancia sobria, 
          aislamiento acústico ideal y atención en cada detalle.
        </p>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roomsData.map((room) => {
          const whatsappUrl = `https://wa.me/573000000000?text=${encodeURIComponent(
            room.whatsappMessage
          )}`;

          return (
            <div
              key={room.id}
              className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group shadow-xl shadow-black/40"
            >
              {/* Room Image Container */}
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent opacity-80" />

                {/* Badge Category */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3.5 py-1.5 rounded-full bg-dark-bg/80 backdrop-blur-md border border-gold-500/40 text-gold-400 text-xs font-semibold uppercase tracking-wider shadow-md">
                    {room.category}
                  </span>
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-4 right-4 z-10 bg-dark-bg/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
                  <span className="text-[10px] text-neutral-gray block uppercase font-medium">Desde</span>
                  <span className="text-xl font-bold text-gold-gradient font-heading">
                    {room.pricePerNight} <span className="text-xs text-neutral-light font-sans font-normal">/ noche</span>
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
                  </div>

                  {/* Top Amenities Pills */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-gray">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                      <Wifi className="w-3 h-3 text-gold-400" /> Wi-Fi
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5">
                      <Wind className="w-3 h-3 text-gold-400" /> A/C
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
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/20 hover:border-gold-500/50 bg-white/5 hover:bg-white/10 text-neutral-light text-xs font-semibold transition-all"
                  >
                    <Eye className="w-4 h-4 text-gold-400" />
                    <span>Ver detalles</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-md shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all"
                    title="Reservar por WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span className="hidden sm:inline">Reservar</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Details Modal */}
      <RoomModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </section>
  );
}
