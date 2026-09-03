import { NextResponse } from "next/server";
import {
  searchReservations,
  getReservationsStats,
  updateReservationStatus,
} from "@/lib/inventory";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, ngrok-skip-browser-warning",
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "ALL";

    const reservations = searchReservations(query, status);
    const stats = getReservationsStats();

    return NextResponse.json({
      success: true,
      count: reservations.length,
      stats,
      reservations,
    });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar las reservas" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { reference, status } = body;

    if (!reference || !status) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros 'reference' o 'status'" },
        { status: 400 }
      );
    }

    const updated = updateReservationStatus(reference, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const stats = getReservationsStats();

    // Si el estado es CONFIRMED, enviar automáticamente la factura al WhatsApp y al Email del cliente
    let waResult = null;
    if (status === "CONFIRMED") {
      try {
        const { sendPaidInvoiceWhatsAppToCustomer } = await import("@/lib/whatsapp");
        waResult = await sendPaidInvoiceWhatsAppToCustomer({
          reference: updated.reference,
          customerName: updated.customerName,
          documentType: updated.documentType,
          documentNumber: updated.documentNumber,
          phone: updated.phone,
          email: updated.email,
          checkIn: updated.checkIn,
          checkOut: updated.checkOut,
          nights: updated.nights,
          items: updated.items || [],
          totalAmount: updated.totalAmount,
        });
      } catch (waErr) {
        console.error("[API] Error enviando WhatsApp automático al cliente:", waErr);
      }

      // Despacho de Email Confirmado en background si hay email registrado
      if (updated.email) {
        try {
          const { sendBookingConfirmedEmail } = await import("@/lib/email");
          sendBookingConfirmedEmail({
            reference: updated.reference,
            customerName: updated.customerName,
            email: updated.email,
            documentType: updated.documentType,
            documentNumber: updated.documentNumber,
            checkIn: updated.checkIn,
            checkOut: updated.checkOut,
            nights: updated.nights,
            items: updated.items || [],
            totalAmount: updated.totalAmount,
          }).catch((e) => console.error("[API] Error enviando email confirmado:", e));
        } catch (mailErr) {
          console.error("[API] Error cargando servicio de email:", mailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      reservation: updated,
      stats,
      whatsappSent: !!waResult?.deliveredAutomatically,
      provider: waResult?.provider || "none",
      whatsappLink: waResult?.waLink,
      whatsappError: waResult?.error,
    });
  } catch (error) {
    console.error("Error al actualizar estado de reserva:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la reserva" },
      { status: 500 }
    );
  }
}
