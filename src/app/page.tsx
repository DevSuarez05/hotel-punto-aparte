import Hero from "@/components/Hero";
import RoomsSection from "@/components/RoomsSection";
import Gallery from "@/components/Gallery";
import LobbyShowcase from "@/components/LobbyShowcase";
import LocationMap from "@/components/LocationMap";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

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
            Combinamos una ubicación inmejorable en Quibdó con espacios diseñados para el confort pleno y la tranquilidad de nuestros huéspedes.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="glass-card glass-card-hover p-8 rounded-2xl border border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 font-bold text-2xl font-heading">
              01
            </div>
            <h3 className="font-heading text-xl font-semibold text-neutral-light mb-3">
              Habitaciones Ejecutivas
            </h3>
            <p className="text-sm text-neutral-gray leading-relaxed font-light">
              Espacios insonorizados, climatización avanzada, camas de alta gama y ambiente sobrio para un descanso reconfortante.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-2xl border border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-orange-brand/10 border border-orange-brand/30 flex items-center justify-center text-orange-brand mb-6 font-bold text-2xl font-heading">
              02
            </div>
            <h3 className="font-heading text-xl font-semibold text-neutral-light mb-3">
              Ubicación Privilegiada
            </h3>
            <p className="text-sm text-neutral-gray leading-relaxed font-light">
              Ubicado estratégicamente en el corazón de Quibdó, a pasos de la zona comercial, bancaria y del pasaje peatonal Alameda Reyes.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-8 rounded-2xl border border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-6 font-bold text-2xl font-heading">
              03
            </div>
            <h3 className="font-heading text-xl font-semibold text-neutral-light mb-3">
              Servicio de Excelencia
            </h3>
            <p className="text-sm text-neutral-gray leading-relaxed font-light">
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







