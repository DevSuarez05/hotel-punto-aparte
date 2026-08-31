/**
 * ============================================================================
 * HOTEL PUNTO APARTE - CONFIGURACIÓN DE INVENTARIO Y MODELOS DE DATOS
 * ============================================================================
 * 
 * Configuración oficial de tarifas, categorías de habitaciones e inventario.
 * Capacidad total instalada: 23 Habitaciones distribuidas en 4 categorías oficiales.
 */

// ============================================================================
// 1. TIPOS FUERTEMENTE TIPADOS Y ENUMS
// ============================================================================

export type RoomCategoryId =
  | "doble-ac"
  | "doble-ventilador"
  | "sencilla-ac"
  | "sencilla-ventilador";

export type CategoryCode = "A" | "B" | "C" | "D";

export type ClimateControl = "ac" | "fan";

export type BedTypeCategory = "doble" | "sencilla";

export type AmenityTag =
  | "ac"
  | "fan"
  | "wifi"
  | "smart_tv"
  | "private_bathroom"
  | "hot_water"
  | "work_desk"
  | "safe_box"
  | "room_service_24_7"
  | "anti_seismic";

export interface RoomFilterOptions {
  climateControl?: ClimateControl | "all";
  bedCategory?: BedTypeCategory | "all";
  minCapacity?: number;
  maxPrice?: number;
  tags?: AmenityTag[];
}

export interface Room {
  /** Slug / Identificador único de la categoría */
  id: RoomCategoryId;
  /** Código de categorización interna (A, B, C, D) */
  categoryCode: CategoryCode;
  /** Nombre comercial descriptivo */
  name: string;
  /** Categoría resumida */
  category: string;
  /** Lema o propuesta de valor */
  tagline: string;
  /** Tarifa formateada en moneda local (Ej: $ 140.000 COP) */
  pricePerNight: string;
  /** Tarifa numérica en pesos colombianos (COP) */
  priceNumeric: number;
  /** Capacidad recomendada de huéspedes */
  capacity: string;
  /** Capacidad numérica máxima de personas */
  maxCapacityNumber: number;
  /** Superficie estimada en m² */
  size: string;
  /** Descripción del tipo de cama */
  bedType: string;
  /** Tag filtrable de tipo de cama: 'doble' | 'sencilla' */
  bedCategory: BedTypeCategory;
  /** Tipo de climatización: 'ac' | 'fan' */
  climateControl: ClimateControl;
  /** Etiqueta descriptiva del sistema de ventilación/clima */
  climateLabel: string;
  /** Stock oficial de habitaciones de este tipo */
  availableUnits: number;
  /** Lista de tags técnicos para filtros dinámicos */
  tags: AmenityTag[];
  /** Ruta a la imagen principal */
  image: string;
  /** Ruta al recurso panorámico interactivo 360° */
  panoramaImage?: string;
  /** Servicios y amenidades incluidas */
  services: string[];
  /** Descripción detallada */
  description: string;
  /** Puntos clave o beneficios destacados */
  highlights: string[];
  /** Mensaje predeterminado de consulta rápida por WhatsApp */
  whatsappMessage: string;
}

// ============================================================================
// 2. CONSTANTES GLOBALES Y REGLAS DE NEGOCIO
// ============================================================================

export const TOTAL_HOTEL_ROOMS = 23 as const;

/**
 * Formateador de moneda nativo para Pesos Colombianos (COP)
 * Utiliza Intl.NumberFormat para apegarse al estándar 'es-CO'.
 * 
 * @param amount - Valor numérico a formatear
 * @param includeSuffix - Si se incluye el sufijo "COP" (por defecto true)
 * @returns Cadena formateada ej: "$ 140.000 COP" o "$ 140.000"
 */
export const formatCOP = (amount: number, includeSuffix = true): string => {
  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  return includeSuffix ? `${formatted} COP` : formatted;
};

import { HOTEL_CONFIG } from "./config";

export interface BuildWhatsAppBookingOptions {
  roomName: string;
  pricePerNight: number | string;
  nights?: number;
  totalAmount?: number | string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

/**
 * Construye el mensaje oficial pre-diligenciado para consulta y reserva por WhatsApp Business
 */
export const buildWhatsAppBookingMessage = ({
  roomName,
  pricePerNight,
  nights = 1,
  totalAmount,
}: BuildWhatsAppBookingOptions): string => {
  const priceFormatted = typeof pricePerNight === "number" ? formatCOP(pricePerNight) : pricePerNight;
  const totalFormatted = totalAmount
    ? typeof totalAmount === "number" ? formatCOP(totalAmount) : totalAmount
    : typeof pricePerNight === "number" ? formatCOP(pricePerNight * nights) : pricePerNight;

  return `¡Hola Hotel Punto Aparte! Me gustaría consultar disponibilidad de reserva para:
- Habitaciones: ${roomName}
- Precio: ${priceFormatted}
- Noches: ${nights} ${nights === 1 ? "Noche" : "Noches"}
- Total Estimado: ${totalFormatted}`;
};

/**
 * Construye el enlace directo hacia la API de WhatsApp con el mensaje codificado
 */
export const buildWhatsAppBookingUrl = (options: BuildWhatsAppBookingOptions): string => {
  const message = buildWhatsAppBookingMessage(options);
  return `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(message)}`;
};

// ============================================================================
// 3. INVENTARIO OFICIAL DE HABITACIONES
// ============================================================================

export const roomsData: Room[] = [
  {
    id: "doble-ac",
    categoryCode: "A",
    name: "Habitación Doble con Aire Acondicionado",
    category: "Categoría A · Doble Confort A/C",
    tagline: "Amplitud y máxima frescura climatizada para viajes compartidos, corporativos o descanso familiar en Quibdó.",
    priceNumeric: 140000,
    pricePerNight: formatCOP(140000),
    capacity: "2 - 4 Personas",
    maxCapacityNumber: 4,
    size: "36 m²",
    bedType: "2 Camas Dobles / Queen Size",
    bedCategory: "doble",
    climateControl: "ac",
    climateLabel: "Aire Acondicionado Climatizado",
    availableUnits: 5,
    tags: [
      "ac",
      "wifi",
      "smart_tv",
      "private_bathroom",
      "work_desk",
      "room_service_24_7",
      "anti_seismic",
    ],
    image: "/assets/images/hotel/habitacion-matrimonial.jpg",
    services: [
      "Aire Acondicionado Climatizado de Alta Eficiencia",
      "Wi-Fi ultrarrápido de alta velocidad",
      "Smart TV 55'' UHD",
      "Baño privado espacioso",
      "Lencería de alta gama",
      "Escritorio de trabajo",
      "Atención y recepción 24/7",
    ],
    description:
      "Nuestra habitación doble prémium cuenta con sistema de aire acondicionado silencioso de última tecnología, dos camas confortables y espacio amplio para una estadía placentera y climatizada en el centro de Quibdó.",
    highlights: [
      "Climatización de alto rendimiento",
      "Inventario disponible: 5 habitaciones",
      "Ideal para grupos corporativos y familias",
    ],
    whatsappMessage: buildWhatsAppBookingMessage({
      roomName: "Habitación Doble con Aire Acondicionado (Categoría A)",
      pricePerNight: 140000,
      nights: 1,
      totalAmount: 140000,
    }),
  },
  {
    id: "doble-ventilador",
    categoryCode: "B",
    name: "Habitación Doble con Ventilador",
    category: "Categoría B · Doble Estándar Ventilador",
    tagline: "Excelente relación calidad-precio con ventilación continua y ambiente amplio y acogedor.",
    priceNumeric: 100000,
    pricePerNight: formatCOP(100000),
    capacity: "2 - 4 Personas",
    maxCapacityNumber: 4,
    size: "34 m²",
    bedType: "2 Camas Matrimoniales Dobles",
    bedCategory: "doble",
    climateControl: "fan",
    climateLabel: "Ventilador de Alta Potencia",
    availableUnits: 3,
    tags: [
      "fan",
      "wifi",
      "smart_tv",
      "private_bathroom",
      "room_service_24_7",
      "anti_seismic",
    ],
    image: "/assets/images/hotel/habitacion-doble-sencilla.jpg",
    services: [
      "Ventilador de Techo / Alto Caudal",
      "Wi-Fi ultrarrápido",
      "Smart TV HD",
      "Baño privado con ducha",
      "Mesa auxiliar",
      "Atención 24/7",
    ],
    description:
      "Una alternativa económica y espaciosa equipada con sistema de ventilación de alto flujo que garantiza frescura y circulación constante de aire natural.",
    highlights: [
      "Ventilación continua de alta eficiencia",
      "Inventario disponible: 3 habitaciones",
      "Tarifa altamente competitiva para parejas y familias",
    ],
    whatsappMessage: buildWhatsAppBookingMessage({
      roomName: "Habitación Doble con Ventilador (Categoría B)",
      pricePerNight: 100000,
      nights: 1,
      totalAmount: 100000,
    }),
  },
  {
    id: "sencilla-ac",
    categoryCode: "C",
    name: "Habitación Sencilla con Aire Acondicionado",
    category: "Categoría C · Sencilla Ejecutiva A/C",
    tagline: "El espacio ideal e insonorizado para el viajero de negocios o descanso individual de primer nivel.",
    priceNumeric: 80000,
    pricePerNight: formatCOP(80000),
    capacity: "1 - 2 Personas",
    maxCapacityNumber: 2,
    size: "24 m²",
    bedType: "1 Cama Queen / Cama Sencilla",
    bedCategory: "sencilla",
    climateControl: "ac",
    climateLabel: "Aire Acondicionado",
    availableUnits: 8,
    tags: [
      "ac",
      "wifi",
      "smart_tv",
      "private_bathroom",
      "hot_water",
      "work_desk",
      "safe_box",
      "anti_seismic",
    ],
    image: "/assets/images/hotel/habitacion-matrimonial.jpg",
    services: [
      "Aire Acondicionado Insonorizado",
      "Wi-Fi ultrarrápido simétrico",
      "Smart TV 50'' UHD",
      "Baño privado con agua caliente",
      "Escritorio ergonómico",
      "Caja de seguridad",
    ],
    description:
      "Diseñada para el ejecutivo moderno que exige confort térmico total, silencio reparador y conectividad de alta velocidad en el corazón comercial de Quibdó.",
    highlights: [
      "Climatización individual inteligente",
      "Inventario disponible: 8 habitaciones",
      "Zona de trabajo ejecutiva integrada",
    ],
    whatsappMessage: buildWhatsAppBookingMessage({
      roomName: "Habitación Sencilla con Aire Acondicionado (Categoría C)",
      pricePerNight: 80000,
      nights: 1,
      totalAmount: 80000,
    }),
  },
  {
    id: "sencilla-ventilador",
    categoryCode: "D",
    name: "Habitación Sencilla con Ventilador",
    category: "Categoría D · Sencilla Estándar Ventilador",
    tagline: "Alojamiento práctico, limpio y acogedor para estancias ejecutivas o estadías de paso.",
    priceNumeric: 70000,
    pricePerNight: formatCOP(70000),
    capacity: "1 - 2 Personas",
    maxCapacityNumber: 2,
    size: "22 m²",
    bedType: "1 Cama Sencilla Confortable",
    bedCategory: "sencilla",
    climateControl: "fan",
    climateLabel: "Ventilador Potente",
    availableUnits: 7,
    tags: [
      "fan",
      "wifi",
      "smart_tv",
      "private_bathroom",
      "room_service_24_7",
      "anti_seismic",
    ],
    image: "/assets/images/hotel/habitacion-doble-sencilla.jpg",
    services: [
      "Ventilador de Alta Potencia",
      "Wi-Fi ultrarrápido",
      "Smart TV HD",
      "Baño privado",
      "Lencería fresca y desinfectada",
      "Atención y recepción 24/7",
    ],
    description:
      "La opción más económica y práctica del hotel, impecable en higiene, ventilación óptima y privacidad absoluta.",
    highlights: [
      "Ventilación eficiente de aire",
      "Inventario disponible: 7 habitaciones",
      "Tarifa preferencial para estadías cortas y de paso",
    ],
    whatsappMessage: buildWhatsAppBookingMessage({
      roomName: "Habitación Sencilla con Ventilador (Categoría D)",
      pricePerNight: 70000,
      nights: 1,
      totalAmount: 70000,
    }),
  },
];

// ============================================================================
// 4. VALIDACIÓN DE INTEGRIDAD DE INVENTARIO (ASSERT TOTAL = 23)
// ============================================================================

/**
 * Calcula la suma total de unidades físicas de habitaciones en el catálogo.
 */
export const calculateTotalInventory = (rooms: Room[] = roomsData): number => {
  return rooms.reduce((sum, room) => sum + room.availableUnits, 0);
};

/**
 * Valida formalmente que el stock total coincida exactamente con la capacidad hotelera pactada (23 habs).
 * Arroja un error explícito si hay discrepancia de inventario.
 */
export const validateInventoryIntegrity = (rooms: Room[] = roomsData): boolean => {
  const currentTotal = calculateTotalInventory(rooms);
  if (currentTotal !== TOTAL_HOTEL_ROOMS) {
    throw new Error(
      `[INVENTORY INTEGRITY ERROR]: El inventario total de habitaciones es ${currentTotal}, pero se esperaban exactamente ${TOTAL_HOTEL_ROOMS} habitaciones.`
    );
  }
  return true;
};

// Ejecución de validación de integridad al cargar el módulo
validateInventoryIntegrity(roomsData);

// ============================================================================
// 5. FUNCIONES AUXILIARES DE FILTRADO Y CONSULTA
// ============================================================================

/**
 * Obtiene el resumen consolidado del inventario por climatización y tipo de cama
 */
export const getInventorySummary = () => {
  return {
    totalRooms: calculateTotalInventory(),
    byCategory: {
      "doble-ac": roomsData.find((r) => r.id === "doble-ac")?.availableUnits ?? 0,
      "doble-ventilador": roomsData.find((r) => r.id === "doble-ventilador")?.availableUnits ?? 0,
      "sencilla-ac": roomsData.find((r) => r.id === "sencilla-ac")?.availableUnits ?? 0,
      "sencilla-ventilador": roomsData.find((r) => r.id === "sencilla-ventilador")?.availableUnits ?? 0,
    },
    byClimate: {
      ac: roomsData.filter((r) => r.climateControl === "ac").reduce((s, r) => s + r.availableUnits, 0),
      fan: roomsData.filter((r) => r.climateControl === "fan").reduce((s, r) => s + r.availableUnits, 0),
    },
    byBedCategory: {
      doble: roomsData.filter((r) => r.bedCategory === "doble").reduce((s, r) => s + r.availableUnits, 0),
      sencilla: roomsData.filter((r) => r.bedCategory === "sencilla").reduce((s, r) => s + r.availableUnits, 0),
    },
  };
};

/**
 * Filtra el catálogo de habitaciones por múltiples criterios (clima, tipo de cama, precio y tags)
 */
export const filterRooms = (
  rooms: Room[] = roomsData,
  filters: RoomFilterOptions = {}
): Room[] => {
  return rooms.filter((room) => {
    // Filtro por climatización (A/C vs Ventilador)
    if (filters.climateControl && filters.climateControl !== "all") {
      if (room.climateControl !== filters.climateControl) return false;
    }

    // Filtro por tipo de cama (Doble vs Sencilla)
    if (filters.bedCategory && filters.bedCategory !== "all") {
      if (room.bedCategory !== filters.bedCategory) return false;
    }

    // Filtro por capacidad mínima
    if (filters.minCapacity && room.maxCapacityNumber < filters.minCapacity) {
      return false;
    }

    // Filtro por precio máximo
    if (filters.maxPrice && room.priceNumeric > filters.maxPrice) {
      return false;
    }

    // Filtro por tags de amenidades
    if (filters.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every((tag) => room.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  });
};

/**
 * Busca una habitación por su identificador slug
 */
export const getRoomById = (id: string): Room | undefined => {
  return roomsData.find((room) => room.id === id);
};
