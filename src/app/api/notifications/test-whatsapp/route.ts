import { NextResponse } from "next/server";
import { HOTEL_CONFIG } from "@/data/config";
import {
  sendWhatsAppNotification,
  formatBookingWhatsAppMessage,
} from "@/lib/whatsapp";

function checkTestAuth(req: Request): boolean {
  // En desarrollo siempre permitido; en producción exige header x-admin-token coincidente
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const authHeader = req.headers.get("x-admin-token") || req.headers.get("authorization");
  const adminSecret = process.env.ADMIN_API_KEY || process.env.CRON_SECRET;

  if (adminSecret && authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    return token === adminSecret;
  }

  return false;
}

export async function GET(req: Request) {
  if (!checkTestAuth(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Endpoint disabled or missing admin token in production" },
      { status: 401 }
    );
  }

  try {
    // Restringir destinatario exclusivamente al WhatsApp oficial del hotel para evitar relay de spam
    const targetPhone = HOTEL_CONFIG.whatsappRaw;

    const dummyBooking = {
      invoiceId: `FACT-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: "Prueba Auditoría DevSecOps",
      documentType: "CC",
      documentNumber: "1077458921",
      phone: targetPhone,
      email: "seguridad@hotelpuntoaparte.com",
      checkIn: new Date().toISOString().split("T")[0],
      checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      nights: 2,
      items: [
        {
          name: "Habitación Doble con Aire Acondicionado",
          quantity: 1,
          pricePerNight: 140000,
          totalPrice: 280000,
        },
      ],
      totalAmount: 280000,
      paymentMethodLabel: "Débito Bancolombia / PSE (Simulación)",
      specialRequests: "Notificación de prueba segura generada por el entorno de desarrollo.",
      paymentStatus: "Reserva de Prueba Verificada",
    };

    const formattedMessage = formatBookingWhatsAppMessage(dummyBooking);
    const result = await sendWhatsAppNotification(formattedMessage, targetPhone);

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      messageId: result.messageId || null,
      recipient: targetPhone,
      waLink: `https://wa.me/${targetPhone}?text=${encodeURIComponent(formattedMessage)}`,
      previewMessage: formattedMessage,
      note: "Mensaje generado y enviado de forma segura al número oficial del hotel.",
    });
  } catch (error) {
    console.error("Error en test-whatsapp route:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al procesar prueba de WhatsApp",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  if (!checkTestAuth(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Endpoint disabled or missing admin token in production" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const rawMessage = typeof body.message === "string" ? body.message.slice(0, 1000) : "";
    const customMessage = rawMessage || "Prueba manual de WhatsApp desde API Hotel Punto Aparte";
    // Forzar destino exclusivamente al número corporativo del hotel
    const targetPhone = HOTEL_CONFIG.whatsappRaw;

    const result = await sendWhatsAppNotification(customMessage, targetPhone);

    return NextResponse.json({
      success: result.success,
      provider: result.provider,
      recipient: targetPhone,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al procesar mensaje personalizado",
      },
      { status: 500 }
    );
  }
}
