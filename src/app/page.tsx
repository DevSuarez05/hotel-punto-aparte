import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import RoomsSection from "@/components/RoomsSection";
import Gallery from "@/components/Gallery";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { HOTEL_CONFIG } from "@/data/config";

// Below-the-fold heavy components dynamic loading
const LobbyShowcase = dynamic(() => import("@/components/LobbyShowcase"));
const LocationMap = dynamic(() => import("@/components/LocationMap"));

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg text-neutral-light flex flex-col justify-between selection:bg-gold-500/30 selection:text-neutral-light">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.08),rgba(255,255,255,0))]" />

      {/* Hero Component */}
      <Hero />

      {/* Rooms Section */}
      <RoomsSection />

      {/* Gallery Section */}
      <Gallery />

      {/* Interactive Lobby Showcase Section */}
      <LobbyShowcase />

      {/* Main Features Section */}
      <section id="experiencias" className="px-6 py-20 relative z-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full glass-card border border-gold-500/30 text-xs tracking-widest uppercase text-gold-400 mb-4">
            Excelencia & Confort
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-neutral-light mb-4">
            ¿Por qué elegir <span className="text-gold-gradient">Hotel Punto Aparte</span>?
          </h2>
          <p className="text-neutral-gray max-w-2xl mx-auto font-light text-base sm:text-lg">
            Combinamos una ubicación estratégica en Quibdó con infraestructura moderna de máxima seguridad y confort para nuestros huéspedes.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-left">
          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 font-bold text-xl font-heading">
              01
            </div>
            <h3 className="font-heading text-lg font-semibold text-neutral-light mb-3">
              Habitaciones Ejecutivas
            </h3>
            <p className="text-xs text-neutral-gray leading-relaxed font-light">
              Espacios insonorizados, climatización avanzada, camas de alta gama y ambiente sobrio para un descanso reconfortante.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 font-bold text-xl font-heading">
              02
            </div>
            <h3 className="font-heading text-lg font-semibold text-white mb-3">
              Certificación Antisísmica
            </h3>
            <p className="text-xs text-neutral-gray leading-relaxed font-light">
              {HOTEL_CONFIG.antiSeismic.description}
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-orange-brand/10 border border-orange-brand/30 flex items-center justify-center text-orange-brand mb-6 font-bold text-xl font-heading">
              03
            </div>
            <h3 className="font-heading text-lg font-semibold text-neutral-light mb-3">
              Ubicación Estratégica
            </h3>
            <p className="text-xs text-neutral-gray leading-relaxed font-light">
              Ubicado estratégicamente en el corazón de Quibdó, a pasos de la zona comercial, bancaria y del pasaje peatonal Alameda Reyes.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-2xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 font-bold text-xl font-heading">
              04
            </div>
            <h3 className="font-heading text-lg font-semibold text-neutral-light mb-3">
              Servicio de Excelencia
            </h3>
            <p className="text-xs text-neutral-gray leading-relaxed font-light">
              Wi-Fi ultrarrápido, atención personalizada 24 horas y la auténtica hospitalidad del Chocó para hacerte sentir como en casa.
            </p>
          </div>
        </div>
      </section>

      {/* Location Map Section */}
      <LocationMap />

      {/* Contact Section */}
      <ContactSection />

      {/* Footer Component */}
      <Footer />
    </div>
  );
}








