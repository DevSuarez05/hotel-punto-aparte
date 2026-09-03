import { NextResponse } from "next/server";
import { verifyWompiWebhookSignature } from "@/lib/wompi";
import { HOTEL_CONFIG } from "@/data/config";
import { sendPaymentApprovalNotificationToHotel } from "@/lib/whatsapp";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, ngrok-skip-browser-warning, Bypass-Tunnel-Remainder, Authorization",
    },
  });
}

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

    // Verificación criptográfica obligatoria de firma de webhook de Wompi
    const receivedChecksum = signature?.checksum;
    if (!receivedChecksum) {
      console.error(
        `[WOMPI WEBHOOK SECURITY] ❌ Petición rechazada: Falta firma/checksum en el payload para transacción ${transactionId || "desconocida"}.`
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized: Webhook signature is required" },
        { status: 401 }
      );
    }

    const isSignatureValid = verifyWompiWebhookSignature(
      reference,
      amount_in_cents,
      currency,
      status,
      timestamp,
      receivedChecksum
    );

    if (!isSignatureValid) {
      console.error(
        `[WOMPI WEBHOOK SECURITY] ❌ Petición rechazada: Checksum inválido o manipulado para referencia ${reference}.`
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid webhook cryptographic signature" },
        { status: 401 }
      );
    }

    // LÓGICA DE NEGOCIO SEGÚN ESTADO DE LA TRANSACCIÓN
    let reservationStatus = "PENDIENTE";
    if (status === "APPROVED") {
      reservationStatus = "Confirmada (Pagada con Wompi Bancolombia)";
      console.log(
        `✅ [HOTEL PUNTO APARTE] Reserva ${reference} APROBADA y PAGADA con éxito vía ${payment_method_type}. Cliente: ${customer_email}`
      );

      // Disparar notificación automática a WhatsApp del Hotel
      sendPaymentApprovalNotificationToHotel({
        reference,
        transactionId,
        amountInCents: amount_in_cents,
        currency,
        paymentMethodType: payment_method_type,
        customerEmail: customer_email,
        timestamp: new Date().toLocaleString("es-CO"),
      }).catch((err) =>
        console.error("[WOMPI WEBHOOK] Error al enviar WhatsApp de pago aprobado:", err)
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
