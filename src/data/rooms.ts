export interface Room {
  id: string;
  name: string;
  category: string;
  tagline: string;
  pricePerNight: string;
  priceNumeric: number;
  capacity: string;
  size: string;
  bedType: string;
  image: string;
  services: string[];
  description: string;
  highlights: string[];
  whatsappMessage: string;
}

export const roomsData: Room[] = [
  {
    id: "sencilla-ejecutivo",
    name: "Habitación Sencilla Ejecutivo",
    category: "Ejecutiva",
    tagline: "El equilibrio perfecto entre privacidad, funcionalidad y confort para viajes de negocios o descanso personal.",
    pricePerNight: "$180.000",
    priceNumeric: 180000,
    capacity: "1 - 2 Personas",
    size: "24 m²",
    bedType: "1 Cama Queen Size",
    image: "/rooms/executive_single.jpg",
    services: [
      "Wi-Fi ultrarrápido",
      "Aire acondicionado insonorizado",
      "Smart TV 50'' UHD",
      "Baño privado con agua caliente",
      "Escritorio de trabajo ergonómico",
      "Minibar surtido",
      "Caja de seguridad digital",
    ],
    description:
      "Diseñada minuciosamente para ofrecer un descanso reparador en un ambiente insonorizado y sobrio. Cuenta con un área de trabajo ejecutiva, iluminación cálida graduada y acabado textil de primera calidad.",
    highlights: [
      "Aislamiento acústico de nivel superior",
      "Conexión a internet simétrica de alta velocidad",
      "Atención preferencial a la habitación 24 horas",
    ],
    whatsappMessage: "Hola, deseo consultar disponibilidad y reservar la *Habitación Sencilla Ejecutivo* en Hotel Punto Aparte Quibdó.",
  },
  {
    id: "doble-confort",
    name: "Habitación Doble Confort",
    category: "Confort",
    tagline: "Amplitud y lujo refinado para parejas o viajes compartidos en el corazón de Quibdó.",
    pricePerNight: "$260.000",
    priceNumeric: 260000,
    capacity: "2 - 4 Personas",
    size: "36 m²",
    bedType: "2 Camas Queen Size",
    image: "/rooms/double_comfort.jpg",
    services: [
      "Wi-Fi ultrarrápido",
      "Aire acondicionado climatizado",
      "Smart TV 55'' UHD con Streaming",
      "Baño privado espacioso",
      "Zona de estar con sillón confort",
      "Minibar Premium",
      "Kit de amenidades de lujo",
    ],
    description:
      "Una suite de doble acomodación que destaca por sus amplios espacios y acabados en tonos oscuros y dorados. Ideal para familias pequeñas o acompañantes corporativos que buscan el máximo bienestar.",
    highlights: [
      "Dos camas Queen con lencería de 400 hilos",
      "Vista exterior privilegiada",
      "Desayuno tipo buffet incluido",
    ],
    whatsappMessage: "Hola, deseo consultar disponibilidad y reservar la *Habitación Doble Confort* en Hotel Punto Aparte Quibdó.",
  },
  {
    id: "suite-presidencial",
    name: "Suite Presidencial",
    category: "Presidencial",
    tagline: "La máxima expresión de elegancia, privacidad y hospitalidad distinguida en el Chocó.",
    pricePerNight: "$420.000",
    priceNumeric: 420000,
    capacity: "Hasta 4 Personas",
    size: "58 m²",
    bedType: "1 Cama King Size + Sala Privada",
    image: "/rooms/presidential_suite.jpg",
    services: [
      "Wi-Fi ultrarrápido dedicado",
      "Aire acondicionado inteligente multi-zona",
      "Smart TV 65'' OLED",
      "Baño privado de mármol con Tina / Jacuzzi",
      "Sala de estar VIP independiente",
      "Minibar cortesía de bienvenida",
      "Servicio de Mayordomía 24/7",
    ],
    description:
      "La cima del confort en Hotel Punto Aparte. Disfruta de un majestuoso espacio con sala de estar independiente, ventanales panorámicos, acabados arquitectónicos en madera noble y atención concierge personalizada.",
    highlights: [
      "Jacuzzi privado de relajación",
      "Atención prioritaria y check-in privado en suite",
      "Cóctel de bienvenida de cortesía",
    ],
    whatsappMessage: "Hola, deseo consultar disponibilidad y reservar la exclusiva *Suite Presidencial* en Hotel Punto Aparte Quibdó.",
  },
];
