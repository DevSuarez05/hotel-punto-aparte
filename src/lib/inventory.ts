import { roomsData, RoomCategoryId, Room } from "@/data/rooms";

/**
 * ============================================================================
 * SISTEMA GESTOR DE INVENTARIO Y DISPONIBILIDAD EN TIEMPO REAL
 * Hotel Punto Aparte Quibdó · Capacidad Total: 23 Habitaciones
 * ============================================================================
 */

export interface ActiveReservation {
  id: string;
  reference: string;
  customerName: string;
  items: {
    roomId: RoomCategoryId;
    quantity: number;
  }[];
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  createdAt: string;
}

export interface RoomAvailabilityResult {
  roomId: RoomCategoryId;
  roomName: string;
  totalStock: number;
  occupiedUnits: number;
  availableUnits: number;
  isSoldOut: boolean;
  maxCapacityNumber: number;
}

export interface DateRangeAvailabilityResponse {
  checkIn: string;
  checkOut: string;
  nights: number;
  totalHotelCapacity: number;
  totalAvailableRooms: number;
  roomsAvailability: Record<RoomCategoryId, RoomAvailabilityResult>;
}

// Almacenamiento en memoria persistente a nivel de servidor Node.js
const globalForReservations = globalThis as unknown as {
  activeReservations: ActiveReservation[];
};

if (!globalForReservations.activeReservations) {
  globalForReservations.activeReservations = [];
}

export const activeReservations = globalForReservations.activeReservations;

/**
 * Determina si dos rangos de fechas se traslapan.
 * Rango A: [checkInA, checkOutA)
 * Rango B: [checkInB, checkOutB)
 */
export function doDateRangesOverlap(
  checkInA: string,
  checkOutA: string,
  checkInB: string,
  checkOutB: string
): boolean {
  if (!checkInA || !checkOutA || !checkInB || !checkOutB) return false;

  const startA = new Date(checkInA).getTime();
  const endA = new Date(checkOutA).getTime();
  const startB = new Date(checkInB).getTime();
  const endB = new Date(checkOutB).getTime();

  // Se traslapan si startA < endB && startB < endA
  return startA < endB && startB < endA;
}

/**
 * Calcula la disponibilidad en tiempo real para todas las categorías
 * en un rango de fechas específico.
 */
export function calculateAvailability(
  checkIn: string,
  checkOut: string
): DateRangeAvailabilityResponse {
  const roomsAvailability: Partial<Record<RoomCategoryId, RoomAvailabilityResult>> = {};

  // 1. Obtener todas las reservas activas que se traslapan con las fechas solicitadas
  const overlappingBookings = activeReservations.filter((res) => {
    if (res.status === "CANCELLED") return false;
    return doDateRangesOverlap(checkIn, checkOut, res.checkIn, res.checkOut);
  });

  // 2. Calcular la ocupación por cada categoría de habitación
  let totalAvailableRooms = 0;

  roomsData.forEach((room: Room) => {
    const roomId = room.id;
    const totalStock = room.availableUnits; // Stock físico instalado

    // Sumar unidades ocupadas en las reservas traslapadas
    const occupiedUnits = overlappingBookings.reduce((sum, booking) => {
      const item = booking.items.find((i) => i.roomId === roomId);
      return sum + (item ? item.quantity : 0);
    }, 0);

    const availableUnits = Math.max(0, totalStock - occupiedUnits);
    const isSoldOut = availableUnits === 0;

    totalAvailableRooms += availableUnits;

    roomsAvailability[roomId] = {
      roomId,
      roomName: room.name,
      totalStock,
      occupiedUnits,
      availableUnits,
      isSoldOut,
      maxCapacityNumber: room.maxCapacityNumber,
    };
  });

  // Calcular cantidad de noches
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    checkIn,
    checkOut,
    nights,
    totalHotelCapacity: 23,
    totalAvailableRooms,
    roomsAvailability: roomsAvailability as Record<RoomCategoryId, RoomAvailabilityResult>,
  };
}

/**
 * Registra una nueva reserva confirmada o pendiente en el inventario del servidor.
 */
export function addReservation(reservation: Omit<ActiveReservation, "id" | "createdAt">): ActiveReservation {
  const newReservation: ActiveReservation = {
    ...reservation,
    id: `RES-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
  };

  activeReservations.push(newReservation);
  console.log("[Inventario] Nueva reserva registrada:", newReservation);
  return newReservation;
}

/**
 * Valida si hay stock suficiente para una reserva propuesta antes de procesar el pago.
 */
export function validateBookingAvailability(
  checkIn: string,
  checkOut: string,
  items: { roomId: RoomCategoryId; quantity: number }[]
): { valid: boolean; errorMessage?: string } {
  const availability = calculateAvailability(checkIn, checkOut);

  for (const item of items) {
    const roomStock = availability.roomsAvailability[item.roomId];
    if (!roomStock) {
      return { valid: false, errorMessage: `Categoría no válida: ${item.roomId}` };
    }

    if (item.quantity > roomStock.availableUnits) {
      return {
        valid: false,
        errorMessage: `Agotada la disponibilidad para "${roomStock.roomName}" en las fechas seleccionadas (${checkIn} al ${checkOut}). Disponibles: ${roomStock.availableUnits}, solicitadas: ${item.quantity}.`,
      };
    }
  }

  return { valid: true };
}
