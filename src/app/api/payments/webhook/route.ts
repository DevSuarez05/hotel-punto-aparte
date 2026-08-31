import { NextResponse } from "next/server";
import { verifyWompiWebhookSignature } from "@/lib/wompi";
import { HOTEL_CONFIG } from "@/data/config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, data, signature, timestamp } = body;

    console.log(`[WOMPI WEBHOOK] Recibido evento: ${event} - Timestamp: ${timestamp}`);

    if (event !== "transaction.updated" || !data?.transaction) {
      return NextResponse.json(
        { success: true, message: "Evento recibido e ignorado (no relevante)" },
        { status: 200 }
      );
    }

    const transaction = data.transaction;
    const {
      id: transactionId,
      reference,
      amount_in_cents,
      currency,
      status,
      payment_method_type,
      customer_email,
    } = transaction;

    console.log(
      `[WOMPI WEBHOOK] Transacción ${transactionId} | Ref: ${reference} | Monto: ${amount_in_cents / 100} COP | Estado: ${status} | Método: ${payment_method_type}`
    );

    // Opcional: Verificación criptográfica de firma de webhook de Wompi si viene checksum
    if (signature?.checksum) {
      const isValid = verifyWompiWebhookSignature(
        reference,
        amount_in_cents,
        currency,
        status,
        timestamp,
        signature.checksum
      );

      if (!isValid) {
        console.warn("[WOMPI WEBHOOK] Advertencia: Checksum de webhook no coincide con clave secreta local (verificar WOMPI_EVENTS_SECRET).");
      }
    }

    // LÓGICA DE NEGOCIO SEGÚN ESTADO DE LA TRANSACCIÓN
    let reservationStatus = "PENDIENTE";
    if (status === "APPROVED") {
      reservationStatus = "Confirmada (Pagada con Wompi Bancolombia)";
      console.log(
        `✅ [HOTEL PUNTO APARTE] Reserva ${reference} APROBADA y PAGADA con éxito vía ${payment_method_type}. Cliente: ${customer_email}`
      );
    } else if (status === "DECLINED") {
      reservationStatus = "Rechazada por la Entidad";
      console.warn(`❌ [HOTEL PUNTO APARTE] Reserva ${reference} DECLINADA por el banco.`);
    } else if (status === "VOIDED" || status === "ERROR") {
      reservationStatus = "Anulada o Error";
      console.warn(`⚠️ [HOTEL PUNTO APARTE] Reserva ${reference} ANULADA.`);
    }

    return NextResponse.json(
      {
        success: true,
        transactionId,
        reference,
        status,
        reservationStatus,
        notifiedAt: new Date().toISOString(),
        hotel: HOTEL_CONFIG.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Wompi Webhook:", error);
    return NextResponse.json(
      { success: false, error: "Error procesando notificación de webhook" },
      { status: 500 }
    );
  }
}
