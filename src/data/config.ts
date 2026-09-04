/**
 * ============================================================================
 * HOTEL PUNTO APARTE - CONSTANTES DE CONFIGURACIÓN Y BRANDING OFICIAL
 * ============================================================================
 */

export const HOTEL_CONFIG = {
  name: "Hotel Punto Aparte",
  tagline: "Tu espacio de desconexión en el corazón de Quibdó",
  city: "Quibdó, Chocó, Colombia",
  address: "Calle 26 No. 5 - 37 entre Cra. 5 y 6, Pasaje peatonal Alameda Reyes",
  fullAddress: "Calle 26 No. 5 - 37 entre Cra. 5 y 6, Pasaje peatonal Alameda Reyes — Quibdó, Chocó, Colombia",
  
  // WhatsApp Business Oficial
  whatsappRaw: "573018940859",
  whatsappNumber: "3018940859",
  whatsappFormatted: "+57 301 894 0859",
  whatsappDisplay: "301 894 0859",
  
  // Canales y Redes Sociales Oficiales
  facebookUrl: "https://www.facebook.com/share/1FLCbgj9Nj/?mibextid=wwXIfr",
  instagramUrl: "https://www.instagram.com",
  corporateEmail: "recepcion@hotelpuntoaparte.com",
  
  // Infraestructura y Certificación
  antiSeismic: {
    title: "Estructura y Certificación Antisísmica",
    short: "Edificación Antisísmica Certificada",
    description:
      "El Hotel Punto Aparte cuenta con una infraestructura moderna con estructura y certificación antisísmica que garantiza máxima solidez, seguridad estructural y tranquilidad a todos nuestros huéspedes.",
  },
  
  googleMapsUrl:
    "https://www.google.com/maps?q=5.68925,-76.6568",
} as const;

/**
 * Genera enlaces directos a la API de WhatsApp con mensajes dinámicos codificados
 */
export const createWhatsAppUrl = (messageText: string): string => {
  return `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(messageText)}`;
};
