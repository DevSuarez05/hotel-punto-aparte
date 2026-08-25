"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Calendar } from "lucide-react";
import HotelLogo from "./HotelLogo";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    { name: "Inicio", href: "#inicio" },
    { name: "Habitaciones", href: "#habitaciones" },
    { name: "Experiencias", href: "#experiencias" },
    { name: "Ubicación", href: "#ubicacion" },
    { name: "Contacto", href: "#contacto" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-dark-bg/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/70 py-3"
          : "bg-dark-bg/75 backdrop-blur-md border-b border-white/5 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Official Hotel Logo (Left Side) */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none hover:scale-105 transition-transform"
          >
            <HotelLogo className="h-10 sm:h-12 w-auto" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-white/90 hover:text-gold-400 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gold-500 hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#reservar"
              className="inline-flex items-center gap-2.5 bg-gold-gradient text-dark-bg font-bold px-5 py-2.5 rounded-full text-sm shadow-lg shadow-gold-500/20 border border-gold-400/30 hover:shadow-gold-500/35 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Ahora</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:text-gold-400 hover:border-gold-500/40 focus:outline-none transition-colors"
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gold-400" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-white/10 bg-dark-bg/95 backdrop-blur-2xl px-4 pt-4 pb-6 mt-3 shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-3 mb-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-white hover:text-gold-400 hover:bg-white/5 px-4 py-2.5 rounded-xl transition-colors border-l-2 border-transparent hover:border-gold-500"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-white/10 px-2">
            <a
              href="#reservar"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gold-gradient text-dark-bg font-bold py-3 rounded-xl text-sm shadow-lg shadow-gold-500/20 hover:opacity-95 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Ahora</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
