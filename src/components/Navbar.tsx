"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Calendar, ShoppingCart, Phone, ExternalLink, ShieldCheck, Home, Bed, Sparkles, MapPin, Mail } from "lucide-react";
import HotelLogo from "./HotelLogo";
import { useCart } from "@/context/CartContext";
import { HOTEL_CONFIG } from "@/data/config";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();

  // Bloquear scroll de pantalla cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Inicio", href: "#inicio", icon: Home },
    { name: "Habitaciones & Tarifas", href: "#habitaciones", icon: Bed },
    { name: "Servicios & Experiencias", href: "#experiencias", icon: Sparkles },
    { name: "Ubicación", href: "#ubicacion", icon: MapPin },
    { name: "Contacto & Reservas", href: "#contacto", icon: Mail },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);

    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (href === "#inicio" || href === "#hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-dark-bg/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80 py-3"
            : "bg-dark-bg/85 backdrop-blur-md border-b border-white/5 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo del Hotel */}
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 group focus:outline-none hover:scale-105 transition-transform"
            >
              <HotelLogo className="h-10 sm:h-12 w-auto" />
            </Link>

            {/* Enlaces de Navegación Escritorio */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium text-white/90 hover:text-gold-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gold-500 hover:after:w-full after:transition-all after:duration-300"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Acciones Escritorio */}
            <div className="hidden md:flex items-center gap-3">
              {/* Facebook Link */}
              <a
                href={HOTEL_CONFIG.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10 transition-all group"
                aria-label="Facebook Oficial Hotel Punto Aparte"
                title="Facebook Oficial"
              >
                <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Botón Carrito */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-full bg-white/5 border border-white/10 text-white hover:text-gold-400 hover:border-gold-500/40 transition-all group cursor-pointer"
                aria-label="Abrir Carrito de Compras"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-gradient text-dark-bg font-bold text-[10px] flex items-center justify-center shadow-lg border border-dark-bg">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* CTA Reservar */}
              <a
                href="#habitaciones"
                onClick={(e) => handleNavClick(e, "#habitaciones")}
                className="inline-flex items-center gap-2.5 bg-gold-gradient text-dark-bg font-bold px-5 py-2.5 rounded-full text-sm shadow-lg shadow-gold-500/20 border border-gold-400/30 hover:shadow-gold-500/35 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Calendar className="w-4 h-4" />
                <span>Reservar Ahora</span>
              </a>
            </div>

            {/* Controles Móviles: Carrito y Botón Hamburguesa */}
            <div className="flex md:hidden items-center gap-2 relative z-50">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:text-gold-400 active:scale-95 transition-all cursor-pointer"
                aria-label="Abrir Carrito"
              >
                <ShoppingCart className="w-5 h-5 text-gold-400" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-gradient text-dark-bg font-bold text-[9px] flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* BOTÓN HAMBURGUESA PRINCIPAL */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                className="p-2.5 rounded-xl bg-white/10 border border-gold-500/40 text-white hover:text-gold-400 active:scale-95 transition-all cursor-pointer z-[100] relative flex items-center justify-center"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gold-400" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MENÚ MÓVIL DESPLEGABLE EN CAPA SUPERIOR (Z-INDEX 999) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[999] md:hidden flex flex-col justify-between bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
          {/* Encabezado del Menú Móvil */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-dark-surface/90">
            <HotelLogo className="h-9 w-auto" />

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-gold-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cuerpo con Lista de Enlaces */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="text-xs uppercase font-bold tracking-widest text-gold-400 mb-2 px-1">
              Menú de Navegación
            </div>

            <nav className="flex flex-col gap-2.5">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-base font-semibold text-white hover:text-gold-400 bg-white/5 hover:bg-white/10 px-4 py-4 rounded-2xl border border-white/10 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5 text-gold-400" />
                      <span>{link.name}</span>
                    </div>
                    <span className="text-gold-400 font-bold">→</span>
                  </a>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10 mt-6 space-y-3">
              <div className="text-xs uppercase font-bold tracking-widest text-neutral-gray px-1">
                Reservas & Contacto
              </div>

              {/* Botón WhatsApp */}
              <a
                href={`https://wa.me/${HOTEL_CONFIG.whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366]/20 border border-[#25D366]/40 text-emerald-300 hover:bg-[#25D366]/30 font-bold py-3.5 px-4 rounded-2xl text-sm transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp: {HOTEL_CONFIG.whatsappFormatted}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {/* Ver Carrito */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-3 bg-white/10 border border-white/15 text-white font-bold py-3.5 px-4 rounded-2xl text-sm hover:bg-white/15 transition-all active:scale-[0.98] cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-gold-400" />
                <span>Ver Carrito de Reservas ({itemCount})</span>
              </button>

              {/* Botón Principal Reservar Ahora */}
              <a
                href="#habitaciones"
                onClick={(e) => handleNavClick(e, "#habitaciones")}
                className="w-full inline-flex items-center justify-center gap-3 bg-gold-gradient text-dark-bg font-extrabold py-4 px-4 rounded-2xl text-base shadow-2xl shadow-gold-500/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-dark-bg" />
                <span>💳 Reservar Ahora</span>
              </a>
            </div>
          </div>

          {/* Pie del Menú Móvil */}
          <div className="p-4 border-t border-white/10 bg-black/60 text-center text-xs text-neutral-gray flex items-center justify-between px-6">
            <span>{HOTEL_CONFIG.name} · {HOTEL_CONFIG.city}</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Antisísmico
            </span>
          </div>
        </div>
      )}
    </>
  );
}
