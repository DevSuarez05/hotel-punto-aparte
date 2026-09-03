import fs from "fs";
import path from "path";
import { roomsData, RoomCategoryId, Room } from "@/data/rooms";
import { emitReservationEvent } from "@/lib/events";

/**
 * ============================================================================
 * SISTEMA GESTOR DE INVENTARIO Y BASE DE DATOS DE RESERVAS EN TIEMPO REAL
 * Hotel Punto Aparte Quibdó · Capacidad Total: 23 Habitaciones
 * ============================================================================
 */

export interface ActiveReservation {
  id: string;
  reference: string;
  customerName: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  paymentMethod?: string;
  specialRequests?: string;
  totalAmount?: number;
  items: {
    roomId: RoomCategoryId;
    roomName?: string;
    quantity: number;
    pricePerNight?: number;
  }[];
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights?: number;
  status: "CONFIRMED" | "PENDING_WHATSAPP" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  expiresAt?: string; // TTL para reservas pendientes
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

// Ruta del archivo de persistencia en disco
const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "reservations.json");

/**
 * Carga las reservas desde el archivo local persistente
 */
function loadReservationsFromFile(): ActiveReservation[] {
  try {
    if (typeof window === "undefined" && fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("[Database] No se pudo leer reservations.json, inicializando vacío:", err);
  }
  return [];
}

/**
 * Guarda las reservas en el archivo persistente
 */
function saveReservationsToFile(reservations: ActiveReservation[]): void {
  try {
    if (typeof window === "undefined") {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(reservations, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[Database] Error guardando reservations.json:", err);
  }
}

// Almacenamiento en memoria sincronizado a nivel global de Node.js
const globalForReservations = globalThis as unknown as {
  activeReservations: ActiveReservation[];
};

if (!globalForReservations.activeReservations) {
  globalForReservations.activeReservations = loadReservationsFromFile();
}

export const activeReservations = globalForReservations.activeReservations;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida si una cadena de texto corresponde a una fecha válida con formato YYYY-MM-DD
 */
export function isValidDateString(dateStr?: string): boolean {
  if (!dateStr || typeof dateStr !== "string" || !DATE_REGEX.test(dateStr)) {
    return false;
  }
  const timestamp = Date.parse(dateStr);
  return !isNaN(timestamp);
}

/**
 * Determina si dos rangos de fechas se traslapan de forma segura.
 * Rango A: [checkInA, checkOutA)
 * Rango B: [checkInB, checkOutB)
 */
export function doDateRangesOverlap(
  checkInA: string,
  checkOutA: string,
  checkInB: string,
  checkOutB: string
): boolean {
  if (!isValidDateString(checkInA) || !isValidDateString(checkOutA) || !isValidDateString(checkInB) || !isValidDateString(checkOutB)) {
    return false;
  }

  const startA = new Date(checkInA).getTime();
  const endA = new Date(checkOutA).getTime();
  const startB = new Date(checkInB).getTime();
  const endB = new Date(checkOutB).getTime();

  if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) return false;
  if (endA <= startA || endB <= startB) return false;

  // Se traslapan si startA < endB && startB < endA
  return startA < endB && startB < endA;
}

/**
 * Limpia y actualiza reservas pendientes expiradas (TTL de 60 minutos)
 */
export function cleanExpiredReservations(): void {
  const now = Date.now();
  let changed = false;

  for (const res of activeReservations) {
    if (res.status === "PENDING_WHATSAPP" && res.expiresAt) {
      const expireTime = new Date(res.expiresAt).getTime();
      if (!isNaN(expireTime) && now > expireTime) {
        res.status = "EXPIRED";
        changed = true;
      }
    }
  }

  if (changed) {
    saveReservationsToFile(activeReservations);
  }
}

/**
 * Calcula la disponibilidad en tiempo real para todas las categorías
 * en un rango de fechas específico.
 */
export function calculateAvailability(
  checkIn: string,
  checkOut: string
): DateRangeAvailabilityResponse {
  cleanExpiredReservations();

  const roomsAvailability: Partial<Record<RoomCategoryId, RoomAvailabilityResult>> = {};

  // 1. Obtener todas las reservas activas que se traslapan con las fechas solicitadas
  const overlappingBookings = activeReservations.filter((res) => {
    if (res.status === "CANCELLED" || res.status === "EXPIRED") return false;
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

  const safeCheckIn = isValidDateString(checkIn) ? checkIn : new Date().toISOString().split("T")[0];
  const safeCheckOut = isValidDateString(checkOut) ? checkOut : new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Calcular cantidad de noches
  const start = new Date(safeCheckIn);
  const end = new Date(safeCheckOut);
  const diffTime = end.getTime() - start.getTime();
  const nights = diffTime > 0 ? Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) : 1;

  return {
    checkIn: safeCheckIn,
    checkOut: safeCheckOut,
    nights,
    totalHotelCapacity: 23,
    totalAvailableRooms,
    roomsAvailability: roomsAvailability as Record<RoomCategoryId, RoomAvailabilityResult>,
  };
}

/**
 * Registra una nueva reserva en el sistema y la persiste en disco
 */
export function addReservation(reservation: Omit<ActiveReservation, "id" | "createdAt">): ActiveReservation {
  cleanExpiredReservations();

  const newReservation: ActiveReservation = {
    ...reservation,
    id: `RES-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    expiresAt: reservation.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60 min TTL
  };

  activeReservations.push(newReservation);
  saveReservationsToFile(activeReservations);
  console.log("[Base de Datos] ✅ Reserva persistida exitosamente:", newReservation.reference || newReservation.id);
  
  // Notificar sincronización en tiempo real a clientes y panel
  emitReservationEvent("RESERVATION_CREATED", newReservation);

  return newReservation;
}

/**
 * Obtiene todas las reservas guardadas
 */
export function getAllReservations(): ActiveReservation[] {
  cleanExpiredReservations();
  return activeReservations;
}

/**
 * Actualiza el estado de una reserva (ej: CONFIRMED, CANCELLED)
 */
export function updateReservationStatus(
  referenceOrId: string,
  newStatus: ActiveReservation["status"]
): ActiveReservation | null {
  const reservation = activeReservations.find(
    (r) => r.reference === referenceOrId || r.id === referenceOrId
  );

  if (reservation) {
    reservation.status = newStatus;
    saveReservationsToFile(activeReservations);
    
    // Notificar actualización en tiempo real a clientes y panel
    emitReservationEvent("STATUS_CHANGED", reservation);
    
    return reservation;
  }
  return null;
}

/**
 * Valida si hay stock suficiente para una reserva propuesta antes de procesarla.
 */
export function validateBookingAvailability(
  checkIn: string,
  checkOut: string,
  items: { roomId: RoomCategoryId; quantity: number }[]
): { valid: boolean; errorMessage?: string } {
  cleanExpiredReservations();
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

/**
 * Obtiene métricas y estadísticas consolidadas para el panel de administración
 */
export function getReservationsStats() {
  cleanExpiredReservations();

  let totalRevenue = 0;
  let pendingCount = 0;
  let confirmedCount = 0;
  let cancelledCount = 0;
  let expiredCount = 0;

  for (const r of activeReservations) {
    if (r.status === "CONFIRMED") {
      confirmedCount++;
      totalRevenue += r.totalAmount || 0;
    } else if (r.status === "PENDING_WHATSAPP") {
      pendingCount++;
    } else if (r.status === "CANCELLED") {
      cancelledCount++;
    } else if (r.status === "EXPIRED") {
      expiredCount++;
    }
  }

  return {
    totalReservations: activeReservations.length,
    confirmedCount,
    pendingCount,
    cancelledCount,
    expiredCount,
    totalRevenue,
    hotelCapacity: 23,
  };
}

/**
 * Filtra y busca reservas con criterios múltiples (búsqueda textual y estado)
 */
export function searchReservations(query?: string, status?: string) {
  cleanExpiredReservations();
  let results = [...activeReservations].reverse();

  if (status && status !== "ALL") {
    results = results.filter((r) => r.status === status);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (r) =>
        r.reference?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q) ||
        r.documentNumber?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q)
    );
  }

  return results;
}

