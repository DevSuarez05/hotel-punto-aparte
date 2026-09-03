import { EventEmitter } from "events";

/**
 * ============================================================================
 * SISTEMA DE EVENTOS EN TIEMPO REAL (EVENT BUS GLOBAL)
 * ============================================================================
 * Sincroniza en caliente la Base de Datos, las API Routes, la Web Pública
 * y el Panel Administrativo de Recepción mediante Server-Sent Events (SSE).
 * ============================================================================
 */

export interface RealtimeReservationEvent {
  type: "RESERVATION_CREATED" | "RESERVATION_UPDATED" | "STATUS_CHANGED" | "INVENTORY_CHANGED";
  timestamp: string;
  data?: any;
}

// EventEmitter persistente en el contexto global de Node.js
const globalForEvents = globalThis as unknown as {
  reservationEmitter: EventEmitter;
};

if (!globalForEvents.reservationEmitter) {
  globalForEvents.reservationEmitter = new EventEmitter();
  // Permitir hasta 100 clientes conectados concurrentemente a la sincronización
  globalForEvents.reservationEmitter.setMaxListeners(100);
}

export const reservationEmitter = globalForEvents.reservationEmitter;

/**
 * Emite un evento en tiempo real para todos los clientes conectados
 */
export function emitReservationEvent(
  type: RealtimeReservationEvent["type"],
  data?: any
) {
  const event: RealtimeReservationEvent = {
    type,
    timestamp: new Date().toISOString(),
    data,
  };
  reservationEmitter.emit("realtime_event", event);
}
