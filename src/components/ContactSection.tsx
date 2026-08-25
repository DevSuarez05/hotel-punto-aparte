"use client";

import { useState } from "react";
import { Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", phone: "", email: "", message: "" });
      alert("¡Gracias por contactarnos! Un asesor de Hotel Punto Aparte te responderá pronto.");
    }, 1500);
  };

  const whatsappUrl = "https://wa.me/573132912088?text=Hola%2C%20quisiera%20solicitar%20informaci%C3%B3n%20y%20reservar%20en%20Hotel%20Punto%20Aparte%20Quibd%C3%B3";

  return (
    <section id="contacto" className="py-24 px-4 sm:px-6 lg:px-8 bg-dark-bg relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-gold-500/30 text-xs tracking-widest uppercase text-gold-400 mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
            Atención Directa
          </span>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white mb-6">
            Escríbenos tu <span className="text-gold-gradient">Consulta o Reserva</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-gray max-w-2xl mx-auto font-light leading-relaxed">
            Nuestro equipo de recepción está a tu disposición las 24 horas para resolver tus inquietudes y confirmar tu estadía.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Channels Card */}
          <div className="lg:col-span-5 glass-card p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl shadow-black/50">
            <h3 className="font-heading text-xl font-bold text-white mb-2">
              Canales de Atención 24/7
            </h3>
            <p className="text-xs text-neutral-gray font-light leading-relaxed mb-6">
              Comunícate con nosotros por cualquiera de nuestras líneas rápidas o escríbenos directamente por WhatsApp.
            </p>

            {/* Direct WhatsApp & Phone */}
            <div className="flex items-start gap-4 border-t border-white/10 pt-5">
              <div className="w-11 h-11 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0">
                <svg className="w-5 h-5 fill-current text-[#25D366]" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-gray font-medium block mb-0.5">
                  WhatsApp Directo
                </span>
                <p className="text-base font-bold text-white font-heading">
                  +57 313 291 2088
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40 hover:scale-105"
                >
                  <span>Chat por WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Telephone Landline */}
            <div className="flex items-center gap-3.5 border-t border-white/10 pt-5">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-gray block uppercase font-medium">Línea Fija Recepción</span>
                <span className="text-sm font-semibold text-white">(604) 671 2525</span>
              </div>
            </div>

            {/* Email & Availability */}
            <div className="flex items-center gap-3.5 border-t border-white/10 pt-5">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-gray block uppercase font-medium">Correo Electrónico</span>
                <span className="text-xs font-medium text-white">contacto@hotelpuntoaparte.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 border-t border-white/10 pt-5">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-neutral-gray block uppercase font-medium">Disponibilidad</span>
                <span className="text-xs font-medium text-white">Recepción permanente 24 / 7</span>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="lg:col-span-7 glass-card p-8 rounded-3xl border border-white/10 shadow-xl shadow-black/50">
            <h4 className="font-heading text-2xl font-bold text-white mb-2">
              Mensaje Directo a Recepción
            </h4>
            <p className="text-xs text-neutral-gray font-light mb-6">
              Llena el siguiente formulario y te responderemos inmediatamente a tu correo o teléfono.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-neutral-gray block mb-1">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carlos Murillo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-neutral-gray block mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 313 291 2088"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-neutral-gray block mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-neutral-gray block mb-1">
                  Mensaje o Solicitud de Reserva
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escribe tu mensaje, fechas aproximadas o preguntas sobre las habitaciones..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="w-full bg-gold-gradient text-dark-bg font-bold py-3.5 px-6 rounded-xl hover:shadow-lg hover:shadow-gold-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-dark-bg" />
                    <span>¡Mensaje Enviado!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Mensaje</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
