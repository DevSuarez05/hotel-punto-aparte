import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { HOTEL_CONFIG } from "@/data/config";
import { validateBookingAvailability, addReservation } from "@/lib/inventory";

/**
 * ============================================================================
 * POST /api/checkout
 *
 * Crea un Payment Link firmado vía la API REST oficial de Wompi
 * (sandbox.wompi.co/v1/payment_links) usando la llave privada del servidor.
 * Retorna la URL de checkout generada por Wompi para redirigir al cliente.
 * ============================================================================
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, reservation, clientBaseUrl } = body;

    if (!customer || !reservation) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos de la reserva" },
        { status: 400 }
      );
    }

    // --- Validar Disponibilidad e Inventario Real (Anti-Overbooking) ---
    const reservationItems = (reservation.items || []).map((item: any) => ({
      roomId: item.id || "doble-ac",
      quantity: item.quantity || 1,
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

    // --- Datos de factura ---
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `FACT-${year}-${randomNum}`;
    const createdAt = new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formatCurrency = (val: number) =>
      `$ ${val.toLocaleString("es-CO")} COP`;

    const docFormatted = `${customer.documentType || "CC"} ${customer.documentNumber || customer.documentId}`;

    let paymentMethodLabel = "Débito en Línea Bancolombia / PSE";
    if (customer.paymentMethod === "card") {
      paymentMethodLabel = "Tarjeta Débito / Crédito";
    }

    const totalInCents = Math.round((reservation.totalAmount || 140000) * 100);

    // --- URL Base Dinámica (compatible con Ngrok / túneles / producción) ---
    // Prioridad: NEXT_PUBLIC_BASE_URL env > x-forwarded-host header > origin header > fallback
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const hostHeader = req.headers.get("host");
    const originHeader = req.headers.get("origin");

    let baseUrl: string;
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      // 1. Variable de entorno explícita (máxima prioridad)
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");
    } else if (clientBaseUrl && !clientBaseUrl.includes("localhost")) {
      // 2. URL del cliente (window.location.origin) — ideal para Ngrok
      baseUrl = clientBaseUrl;
    } else if (forwardedHost) {
      // 3. Ngrok / reverse proxy establece x-forwarded-host
      baseUrl = `${forwardedProto}://${forwardedHost}`;
    } else if (originHeader && !originHeader.includes("localhost")) {
      // 4. Origin header (si no es localhost)
      baseUrl = originHeader;
    } else if (hostHeader && !hostHeader.includes("localhost")) {
      // 5. Host header directo
      const proto = req.url.startsWith("https") ? "https" : "http";
      baseUrl = `${proto}://${hostHeader}`;
    } else {
      // 6. Fallback a localhost (desarrollo local)
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    }

    console.log("[Checkout] Base URL resuelta:", baseUrl);

    const redirectUrl = `${baseUrl}/?status=APPROVED&reference=${encodeURIComponent(invoiceId)}`;

    // --- Credenciales Wompi desde variables de entorno ---
    const privateKey =
      process.env.WOMPI_PRIVATE_KEY ||
      "prv_test_58YyR0k4xJ1k9rT2v8p0m4n6q7";

    // Determinar el ambiente (sandbox vs producción) según el prefijo de la llave
    const isSandbox = privateKey.startsWith("prv_test_");
    const wompiApiBase = isSandbox
      ? "https://sandbox.wompi.co/v1"
      : "https://production.wompi.co/v1";

    // --- Fecha de expiración: 2 horas desde ahora ---
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    // --- Crear Payment Link vía API Wompi ---
    const paymentLinkBody = {
      name: `Reserva Hotel Punto Aparte - ${customer.fullName}`,
      description: `Pago de Reserva - Factura ${invoiceId} · ${reservation.nights} noche(s) · ${reservation.checkIn} al ${reservation.checkOut}`,
      single_use: true,
      collect_shipping: false,
      currency: "COP",
      amount_in_cents: totalInCents,
      redirect_url: redirectUrl,
      image_url: `${baseUrl}/favicon.ico`,
      expires_at: expiresAt,
      customer_data: {
        customer_references: [
          { label: "Factura", value: invoiceId },
          { label: "Documento", value: docFormatted },
        ],
      },
    };

    console.log("[Wompi] Creando Payment Link:", {
      url: `${wompiApiBase}/payment_links`,
      body: paymentLinkBody,
    });

    const wompiResponse = await fetch(`${wompiApiBase}/payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${privateKey}`,
      },
      body: JSON.stringify(paymentLinkBody),
    });

    const wompiData = await wompiResponse.json();

    console.log("[Wompi] Respuesta API:", {
      status: wompiResponse.status,
      data: wompiData,
    });

    // --- Construir la URL de checkout ---
    let checkoutUrl = "";

    if (wompiResponse.ok && wompiData?.data?.id) {
      // URL oficial de checkout firmada por Wompi: https://checkout.wompi.co/l/{ID}
      checkoutUrl = `https://checkout.wompi.co/l/${wompiData.data.id}`;
      console.log("[Wompi] ✅ Payment Link creado exitosamente:", checkoutUrl);
    } else {
      // Si la API falla, registrar el error pero continuar con fallback
      console.error("[Wompi] ❌ Error al crear Payment Link:", {
        status: wompiResponse.status,
        statusText: wompiResponse.statusText,
        error: wompiData?.error || wompiData,
      });

      checkoutUrl = "";
    }

    // Registrar reserva activa en el servidor para descontar stock en estas fechas
    addReservation({
      reference: invoiceId,
      customerName: customer.fullName,
      items: reservationItems,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      status: "CONFIRMED",
    });

    // --- WhatsApp Message ---
    const itemsText = reservation.items
      .map(
        (i: { name: string; quantity: number; totalPrice: number }) =>
          `• ${i.quantity}x ${i.name}: ${formatCurrency(i.totalPrice)}`
      )
      .join("\n");

    const whatsappMessage =
      `*CONFIRMACIÓN DE RESERVA — ${HOTEL_CONFIG.name.toUpperCase()}*\n\n` +
      `🧾 *Factura N°:* ${invoiceId}\n` +
      `👤 *Cliente:* ${customer.fullName}\n` +
      `🆔 *Documento:* ${docFormatted}\n` +
      `📱 *Teléfono:* ${customer.phone}\n` +
      `✉️ *Email:* ${customer.email}\n` +
      `📅 *Entrada:* ${reservation.checkIn}\n` +
      `📅 *Salida:* ${reservation.checkOut} (${reservation.nights} noche(s))\n\n` +
      `🛏️ *Habitaciones Reservadas:*\n${itemsText}\n\n` +
      `💰 *Total Facturado:* ${formatCurrency(reservation.totalAmount)}\n` +
      `💳 *Método de Pago:* ${paymentMethodLabel}\n` +
      `📌 *Estado:* Pago Pendiente\n` +
      (customer.specialRequests ? `📝 *Notas:* ${customer.specialRequests}\n` : "") +
      `\n¡Gracias por elegir Hotel Punto Aparte Quibdó!`;

    const whatsappLink = `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(whatsappMessage)}`;

    // --- Email (Nodemailer) si SMTP está configurado ---
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: smtpUser, pass: smtpPass },
        });

        const itemsListHtml = reservation.items
          .map(
            (item: { name: string; quantity: number; pricePerNight: number; totalPrice: number }) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.pricePerNight)}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatCurrency(item.totalPrice)}</td>
            </tr>
          `
          )
          .join("");

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; padding: 20px; border-radius: 12px;">
            <div style="text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 20px;">
              <h1 style="color: #D4AF37; margin: 0;">${HOTEL_CONFIG.name}</h1>
              <p style="color: #aaa; margin: 5px 0 0 0; font-size: 13px;">${HOTEL_CONFIG.city}</p>
            </div>
            <div style="background-color: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #D4AF37; margin: 0 0 10px 0; font-size: 16px;">FACTURA DE RESERVA N° ${invoiceId}</h2>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Fecha:</strong> ${createdAt}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Cliente:</strong> ${customer.fullName}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Documento:</strong> ${docFormatted}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Teléfono:</strong> ${customer.phone}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Método de Pago:</strong> ${paymentMethodLabel}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Check-in:</strong> ${reservation.checkIn} | <strong>Check-out:</strong> ${reservation.checkOut} (${reservation.nights} noches)</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; color: #fff; margin-bottom: 20px; font-size: 13px;">
              <thead>
                <tr style="background-color: #222; text-align: left; color: #D4AF37;">
                  <th style="padding: 8px;">Habitación</th>
                  <th style="padding: 8px; text-align: center;">Cant.</th>
                  <th style="padding: 8px; text-align: right;">Noche</th>
                  <th style="padding: 8px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsListHtml}</tbody>
            </table>
            <div style="text-align: right; border-top: 1px solid #333; padding-top: 10px; font-size: 16px; color: #D4AF37;">
              <strong>Total General: ${formatCurrency(reservation.totalAmount)}</strong>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"${HOTEL_CONFIG.name}" <${smtpUser}>`,
          to: `${HOTEL_CONFIG.corporateEmail}, ${customer.email}`,
          subject: `Factura y Confirmación de Reserva ${invoiceId} - ${customer.fullName}`,
          html: emailHtml,
        });
      } catch (emailErr) {
        console.warn("SMTP email attempt skipped or failed:", emailErr);
      }
    }

    // --- Respuesta al cliente ---
    return NextResponse.json({
      success: true,
      checkoutUrl,
      redirectUrl,
      reference: invoiceId,
      wompiLinkId: wompiData?.data?.id || null,
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
        paymentMethod: customer.paymentMethod,
        paymentMethodLabel,
        paymentStatus: "Pago Pendiente",
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        nights: reservation.nights,
        items: reservation.items,
        totalAmount: reservation.totalAmount,
        whatsappLink,
        checkoutUrl,
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
