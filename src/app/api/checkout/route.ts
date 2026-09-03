import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { HOTEL_CONFIG } from "@/data/config";
import { validateBookingAvailability, addReservation } from "@/lib/inventory";
import { sendBookingNotificationToHotel } from "@/lib/whatsapp";

/**
 * ============================================================================
 * POST /api/checkout
 *
 * Flujo Senior: Reserva Directa a WhatsApp + Base de Datos e Inventario
 * 1. Valida disponibilidad real (Anti-Overbooking).
 * 2. Genera código de factura y persiste la reserva en Base de Datos.
 * 3. Notifica internamente al hotel vía servicio de WhatsApp.
 * 4. Genera el enlace de WhatsApp (wa.me) con el mensaje estructurado
 *    para que el cliente confirme directamente con la recepción.
 * ============================================================================
 */
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
    const { customer, reservation } = body;

    if (!customer || !reservation) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos de la reserva" },
        { status: 400 }
      );
    }

    // --- 1. Validar Disponibilidad e Inventario Real (Anti-Overbooking) ---
    const reservationItems = (reservation.items || []).map((item: any) => ({
      roomId: item.id || "doble-ac",
      roomName: item.name || "Habitación Hotel Punto Aparte",
      quantity: Number(item.quantity) || 1,
      pricePerNight: Number(item.pricePerNight) || 140000,
    }));

    const availabilityCheck = validateBookingAvailability(
      reservation.checkIn,
      reservation.checkOut,
      reservationItems
    );

    if (!availabilityCheck.valid) {
      return NextResponse.json(
        { success: false, error: availabilityCheck.errorMessage },
        { status: 400 }
      );
    }

    // --- 2. Generar Factura e Identificadores ---
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `FACT-${year}-${randomNum}`;
    const createdAt = new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const formatCurrency = (val: number) =>
      `$ ${val.toLocaleString("es-CO")} COP`;

    const docFormatted = `${customer.documentType || "CC"} ${customer.documentNumber || customer.documentId || ""}`.trim();

    const paymentMethodLabel = "Cuenta de Ahorros Bancolombia";

    // --- 3. Registrar Reserva Activa en Base de Datos Persistente ---
    const savedReservation = addReservation({
      reference: invoiceId,
      customerName: customer.fullName,
      documentType: customer.documentType || "CC",
      documentNumber: customer.documentNumber || "",
      phone: customer.phone,
      email: customer.email,
      paymentMethod: paymentMethodLabel,
      specialRequests: customer.specialRequests || "",
      totalAmount: reservation.totalAmount,
      items: reservationItems,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights,
      status: "PENDING_WHATSAPP",
    });

    // --- 4. Notificación Automática a WhatsApp del Hotel ---
    const waNotification = await sendBookingNotificationToHotel({
      invoiceId,
      fullName: customer.fullName,
      documentId: docFormatted,
      documentType: customer.documentType || "CC",
      documentNumber: customer.documentNumber || customer.documentId,
      phone: customer.phone,
      email: customer.email,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights,
      items: reservation.items || [],
      totalAmount: reservation.totalAmount,
      paymentMethodLabel,
      specialRequests: customer.specialRequests,
      paymentStatus: "Pendiente de Confirmación vía WhatsApp",
      createdAt,
    });

    const whatsappLink = waNotification.waLink;

    // --- 5. Envío de Email con Factura Pendiente ---
    try {
      const { sendBookingPendingEmail } = await import("@/lib/email");
      sendBookingPendingEmail({
        invoiceId,
        fullName: customer.fullName,
        email: customer.email,
        documentType: customer.documentType || "CC",
        documentNumber: customer.documentNumber || customer.documentId,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        nights: reservation.nights || 1,
        items: reservation.items || [],
        totalAmount: reservation.totalAmount,
        whatsappLink,
      }).catch((err) => console.error("[Checkout] Error enviando email pendiente:", err));
    } catch (emailErr) {
      console.error("[Checkout] Error cargando servicio de email:", emailErr);
    }

    // --- 6. Respuesta Exitosa con Enlace Directo a WhatsApp ---
    return NextResponse.json({
      success: true,
      reference: invoiceId,
      reservationId: savedReservation.id,
      whatsappLink,
      invoice: {
        invoiceId,
        createdAt,
        fullName: customer.fullName,
        documentType: customer.documentType || "CC",
        documentNumber: customer.documentNumber || customer.documentId,
        documentId: docFormatted,
        email: customer.email,
        phone: customer.phone,
        specialRequests: customer.specialRequests || "",
        paymentMethod: customer.paymentMethod || "transfer",
        paymentMethodLabel,
        paymentStatus: "Pendiente de Confirmación por WhatsApp",
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        nights: reservation.nights,
        items: reservation.items,
        totalAmount: reservation.totalAmount,
        whatsappLink,
      },
    });
  } catch (error) {
    console.error("API Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Error al generar la reserva" },
      { status: 500 }
    );
  }
}
