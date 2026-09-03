"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Maximize2, X } from "lucide-react";

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: string;
}

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: "recepcion-oficial",
      src: "/assets/images/hotel/recepcion-oficial-hotel.jpg",
      alt: "Recepción de Hotel Punto Aparte Quibdó con pérgola de madera, luces cálidas y atención 24 horas",
      caption: "Recepción Oficial & Atención 24 Horas",
      category: "Recepción & Hall",
    },
    {
      id: "habitacion-matrimonial",
      src: "/assets/images/hotel/habitacion-matrimonial.jpg",
      alt: "Habitación Matrimonial con cama doble, acabados de mármol y cortinas rojas",
      caption: "Acomodación Matrimonial Prémium",
      category: "Habitaciones",
    },
    {
      id: "habitacion-doble-sencilla",
      src: "/assets/images/hotel/habitacion-doble-sencilla.jpg",
      alt: "Habitación con dos camas y techo artesanal en madera de alta calidad",
      caption: "Habitación Doble Familiar con Techo en Madera",
      category: "Habitaciones",
    },
    {
      id: "lobby-zona-estar",
      src: "/assets/images/hotel/lobby-zona-estar.jpg",
      alt: "Lobby y sala de estar con sofás azules, mesa auxiliar y Smart TV",
      caption: "Lobby & Sala de Estar para Huéspedes",
      category: "Zonas Comunes",
    },
    {
      id: "pasillo-principal-madera",
      src: "/assets/images/hotel/pasillo-principal-madera.jpg",
      alt: "Pasillo central con vigas de madera noble e iluminación focalizada",
      caption: "Pasillo Central con Vigas de Madera & Galería",
      category: "Arquitectura & Pasillos",
    },
    {
      id: "pasillos-habitaciones-2",
      src: "/assets/images/hotel/pasillos-habitaciones-2.jpg",
      alt: "Corredor y circulación interna de Hotel Punto Aparte Quibdó",
      caption: "Corredores & Circulación Interna",
      category: "Arquitectura & Pasillos",
    },
  ];

  return (
    <section id="galeria" className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-bg relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-orange-brand/30 text-xs tracking-widest uppercase text-gold-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-brand" />
            Galería Fotográfica Oficial
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white mb-6">
            Conoce <span className="text-gold-gradient">Nuestros Espacios Reales</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-gray max-w-2xl mx-auto font-light leading-relaxed">
            Explora las fotografías oficiales de nuestras habitaciones, lobby, recepción y pasillos con acabados en madera en el centro de Quibdó.
          </p>
        </div>

        {/* Gallery Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-white/10 group cursor-pointer relative flex flex-col justify-end min-h-[280px] sm:min-h-[320px] shadow-xl shadow-black/50"
            >
              {/* Image with lazy loading and object-cover */}
              <Image
                src={item.src}
                alt={item.alt}
                fill
                loading="lazy"
                quality={85}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transform-gpu group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

              {/* Expand Icon Hover Indicator */}
              <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-dark-bg/80 backdrop-blur-md border border-white/20 text-gold-400 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Caption Card Footer */}
              <div className="relative z-10 p-5 space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-brand/20 border border-orange-brand/40 text-orange-brand text-[10px] uppercase font-bold tracking-wider mb-1">
                  {item.category}
                </span>
                <h3 className="font-heading text-sm font-bold text-white group-hover:text-gold-300 transition-colors leading-snug">
                  {item.caption}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center glass-card border border-gold-500/30 rounded-3xl overflow-hidden p-2 sm:p-4 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-30 p-3 rounded-full bg-dark-bg/80 border border-white/20 text-white hover:text-gold-400 hover:border-gold-500/50 transition-all"
              aria-label="Cerrar imagen"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Lightbox Image Container */}
            <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
                className="object-contain object-center"
              />
            </div>

            {/* Lightbox Footer Caption */}
            <div className="w-full text-center py-4 px-6">
              <span className="text-xs uppercase tracking-wider text-orange-brand font-semibold block mb-1">
                {selectedImage.category}
              </span>
              <p className="font-heading text-xl sm:text-2xl font-bold text-white">
                {selectedImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
