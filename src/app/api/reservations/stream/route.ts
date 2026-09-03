import { NextRequest } from "next/server";
import { reservationEmitter, RealtimeReservationEvent } from "@/lib/events";
import { getReservationsStats, getAllReservations } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Enviar estado inicial inmediato al conectarse
      try {
        const initialPayload = {
          type: "INITIAL_SYNC",
          timestamp: new Date().toISOString(),
          stats: getReservationsStats(),
          reservations: getAllReservations(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialPayload)}\n\n`));
      } catch (err) {
        console.error("[SSE] Error enviando snapshot inicial:", err);
      }

      // 2. Suscribirse a eventos globales emitidos por el backend
      const onRealtimeEvent = (event: RealtimeReservationEvent) => {
        try {
          const payload = {
            ...event,
            stats: getReservationsStats(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch (err) {
          console.error("[SSE] Error enviando evento a cliente:", err);
        }
      };

      reservationEmitter.on("realtime_event", onRealtimeEvent);

      // 3. Heartbeat / Keep-alive cada 15 segundos para evitar desconexiones por proxy
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // 4. Limpieza al desconectarse el cliente
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        reservationEmitter.off("realtime_event", onRealtimeEvent);
        try {
          controller.close();
        } catch {
          // Stream ya cerrado
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "ngrok-skip-browser-warning": "true",
    },
  });
}
