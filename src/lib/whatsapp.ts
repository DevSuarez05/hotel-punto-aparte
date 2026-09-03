/**
 * ============================================================================
 * HOTEL PUNTO APARTE - SERVICIO DE NOTIFICACIONES WHATSAPP
 * ============================================================================
 * Este módulo gestiona el envío de notificaciones automáticas al WhatsApp
 * oficial del Hotel (+57 301 894 0859) cuando un cliente genera una reserva.
 *
 * Utiliza formateo universal 100% compatible con todos los navegadores,
 * WhatsApp Web, iOS y Android (evita caracteres o emojis con problemas de encoding).
 * ============================================================================
 */

import { HOTEL_CONFIG } from "@/data/config";
import { HOTEL_PAYMENT_ACCOUNTS } from "@/data/payments";

export interface BookingNotificationData {
  invoiceId: string;
  fullName: string;
  documentId?: string;
  documentType?: string;
  documentNumber?: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  items: Array<{
    name: string;
    quantity: number;
    pricePerNight?: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  paymentMethodLabel?: string;
  specialRequests?: string;
  paymentStatus?: string;
  createdAt?: string;
}

export interface PaymentApprovalData {
  reference: string;
  transactionId?: string;
  amountInCents?: number;
  totalAmount?: number;
  currency?: string;
  paymentMethodType?: string;
  fullName?: string;
  customerEmail?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  itemsSummary?: string;
  timestamp?: string;
}

/**
 * Formatea el mensaje de nueva reserva en estado PENDIENTE DE PAGO
 */
export function formatBookingWhatsAppMessage(data: BookingNotificationData): string {
  const formatCOP = (val: number) => `$ ${val.toLocaleString("es-CO")} COP`;
  const doc = data.documentId || `${data.documentType || "CC"} ${data.documentNumber || ""}`.trim();
  const dateStr =
    data.createdAt ||
    new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const itemsList = (data.items || [])
    .map((i) => `• ${i.quantity}x ${i.name} -> ${formatCOP(i.totalPrice)}`)
    .join("\n");

  const cleanCustomerPhone = (data.phone || "").replace(/\D/g, "");
  const customerWaLink = cleanCustomerPhone
    ? `https://wa.me/${cleanCustomerPhone.startsWith("57") ? cleanCustomerPhone : `57${cleanCustomerPhone}`}`
    : "";

  return (
    `*SOLICITUD DE RESERVA — ${HOTEL_CONFIG.name.toUpperCase()}*\n` +
    `*Factura N°:* ${data.invoiceId}\n` +
    `*Estado:* PENDIENTE DE PAGO (Transferencia Bancolombia)\n` +
    `*Fecha de Emisión:* ${dateStr}\n\n` +
    `----------------------------------------\n` +
    `*DATOS DEL HUÉSPED*\n` +
    `• *Nombre:* ${data.fullName}\n` +
    `• *Documento:* ${doc || "No especificado"}\n` +
    `• *Teléfono:* ${data.phone}\n` +
    (customerWaLink ? `• *Chat Directo con Huésped:* ${customerWaLink}\n` : "") +
    `• *Email:* ${data.email}\n\n` +
    `----------------------------------------\n` +
    `*DETALLES DE LA ESTANCIA*\n` +
    `• *Check-in:* ${data.checkIn} (Desde las 3:00 PM)\n` +
    `• *Check-out:* ${data.checkOut} (Hasta la 1:00 PM)\n` +
    `• *Duración:* ${data.nights} ${data.nights === 1 ? "noche" : "noches"}\n\n` +
    `*HABITACIONES SOLICITADAS:*\n${itemsList || "• Habitación estándar"}\n\n` +
    `----------------------------------------\n` +
    `*CUENTA OFICIAL DE PAGO — BANCOLOMBIA*\n` +
    `• *Banco:* Bancolombia\n` +
    `• *Tipo:* ${HOTEL_PAYMENT_ACCOUNTS.accountType}\n` +
    `• *Número de Cuenta:* ${HOTEL_PAYMENT_ACCOUNTS.accountNumberFormatted}\n` +
    `• *Titular:* ${HOTEL_PAYMENT_ACCOUNTS.beneficiaryName}\n\n` +
    `----------------------------------------\n` +
    `*TOTAL A PAGAR:* *${formatCOP(data.totalAmount)}*\n` +
    `----------------------------------------\n` +
    (data.specialRequests && data.specialRequests.trim()
      ? `*Notas del Huésped:* "${data.specialRequests.trim()}"\n\n`
      : "\n") +
    `*Adjunto mi comprobante de transferencia a Bancolombia para confirmar la reserva.*`
  );
}

/**
 * Formatea el mensaje cuando la reserva ha sido PAGADA Y CONFIRMADA
 */
export function formatPaymentApprovalWhatsAppMessage(data: PaymentApprovalData): string {
  const amountCOP = data.totalAmount
    ? data.totalAmount.toLocaleString("es-CO")
    : data.amountInCents
    ? Math.round(data.amountInCents / 100).toLocaleString("es-CO")
    : "0";
  const time = data.timestamp || new Date().toLocaleString("es-CO");

  return (
    `*CONFIRMACIÓN DE PAGO & RESERVA — ${HOTEL_CONFIG.name.toUpperCase()}*\n` +
    `*Factura N°:* ${data.reference}\n` +
    `*Estado:* PAGADA Y CONFIRMADA (Comprobante Verificado)\n` +
    `*Fecha de Validación:* ${time}\n\n` +
    `----------------------------------------\n` +
    `*DATOS DEL HUÉSPED*\n` +
    (data.fullName ? `• *Nombre:* ${data.fullName}\n` : "") +
    (data.customerEmail ? `• *Email:* ${data.customerEmail}\n` : "") +
    `\n----------------------------------------\n` +
    `*DETALLES DE LA ESTANCIA CONFIRMADA*\n` +
    (data.checkIn ? `• *Check-in:* ${data.checkIn} (A partir de las 3:00 PM)\n` : "") +
    (data.checkOut ? `• *Check-out:* ${data.checkOut} (Hasta la 1:00 PM)\n` : "") +
    (data.nights ? `• *Duración:* ${data.nights} ${data.nights === 1 ? "noche" : "noches"}\n` : "") +
    (data.itemsSummary ? `\n*Habitaciones:* ${data.itemsSummary}\n` : "") +
    `\n----------------------------------------\n` +
    `*MONTO TOTAL ACREDITADO:* *$ ${amountCOP} COP*\n` +
    `• *Medio:* Cuenta de Ahorros Bancolombia\n` +
    `----------------------------------------\n\n` +
    `*¡Su reserva está 100% GARANTIZADA! Lo esperamos en Hotel Punto Aparte (Quibdó, Chocó).*`
  );
}

/**
 * Envía una notificación de WhatsApp usando el proveedor configurado en variables de entorno.
 */
export async function sendWhatsAppNotification(
  message: string,
  targetPhone?: string
): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  const recipient =
    targetPhone ||
    process.env.WHATSAPP_NOTIFICATION_NUMBER ||
    HOTEL_CONFIG.whatsappRaw;

  const provider = (process.env.WHATSAPP_PROVIDER || "auto").toLowerCase();

  try {
    // 1. ULTRAMSG (Pasarela QR WhatsApp Business - Recomendada)
    if (
      provider === "ultramsg" ||
      (provider === "auto" && process.env.ULTRAMSG_INSTANCE_ID && process.env.ULTRAMSG_TOKEN)
    ) {
      const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
      const token = process.env.ULTRAMSG_TOKEN;
      const cleanTo = recipient.replace(/\D/g, "");
      const formattedTo = cleanTo.startsWith("57") ? cleanTo : `57${cleanTo}`;

      const res = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: token!,
          to: formattedTo,
          body: message,
        }),
      });

      const data = await res.json();
      if (res.ok && (data?.sent === "true" || data?.sent === true || data?.id)) {
        return { success: true, provider: "ultramsg", messageId: data.id };
      }
    }

    // 2. EVOLUTION API (Pasarela QR Open Source / Cloud)
    if (
      provider === "evolution" ||
      (provider === "auto" && process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY && process.env.EVOLUTION_INSTANCE)
    ) {
      const apiUrl = (process.env.EVOLUTION_API_URL || "").replace(/\/$/, "");
      const apiKey = process.env.EVOLUTION_API_KEY;
      const instance = process.env.EVOLUTION_INSTANCE;
      const cleanTo = recipient.replace(/\D/g, "");
      const formattedTo = cleanTo.startsWith("57") ? cleanTo : `57${cleanTo}`;

      const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: apiKey!,
        },
        body: JSON.stringify({
          number: formattedTo,
          text: message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, provider: "evolution_api", messageId: data?.key?.id };
      }
    }

    // 3. GREEN API (Pasarela QR)
    if (
      provider === "greenapi" ||
      (provider === "auto" && process.env.GREEN_API_INSTANCE_ID && process.env.GREEN_API_TOKEN)
    ) {
      const instanceId = process.env.GREEN_API_INSTANCE_ID;
      const token = process.env.GREEN_API_TOKEN;
      const cleanTo = recipient.replace(/\D/g, "");
      const formattedTo = cleanTo.startsWith("57") ? cleanTo : `57${cleanTo}`;

      const res = await fetch(`https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: `${formattedTo}@c.us`,
          message: message,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.idMessage) {
        return { success: true, provider: "green_api", messageId: data.idMessage };
      }
    }

    // 4. CALLMEBOT API
    if (
      provider === "callmebot" ||
      (provider === "auto" && process.env.CALLMEBOT_API_KEY)
    ) {
      const apiKey = process.env.CALLMEBOT_API_KEY;
      const phone = process.env.CALLMEBOT_PHONE || recipient;

      if (apiKey) {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
          phone
        )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`;

        const res = await fetch(url, { method: "GET" });
        if (res.ok) {
          return { success: true, provider: "callmebot" };
        }
      }
    }

    // 5. META WHATSAPP CLOUD API OFICIAL
    if (
      provider === "meta" ||
      (provider === "auto" && process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_ID)
    ) {
      const token = process.env.META_WHATSAPP_TOKEN;
      const phoneId = process.env.META_WHATSAPP_PHONE_ID;
      const cleanTo = recipient.replace(/\D/g, "");
      const formattedTo = cleanTo.startsWith("57") ? cleanTo : `57${cleanTo}`;

      const metaUrl = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
      const metaBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedTo,
        type: "text",
        text: { preview_url: false, body: message },
      };

      const res = await fetch(metaUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metaBody),
      });

      const data = await res.json();
      if (res.ok && data?.messages?.[0]?.id) {
        return { success: true, provider: "meta", messageId: data.messages[0].id };
      }
    }

    // 6. TWILIO WHATSAPP API
    if (
      provider === "twilio" ||
      (provider === "auto" && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ) {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
      const toNumber = `whatsapp:+${recipient.replace(/\D/g, "")}`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append("From", fromNumber);
      formData.append("To", toNumber);
      formData.append("Body", message);

      const res = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${auth}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await res.json();
      if (res.ok && data?.sid) {
        return { success: true, provider: "twilio", messageId: data.sid };
      }
    }

    // 7. CUSTOM WEBHOOK
    if (process.env.WHATSAPP_WEBHOOK_URL) {
      const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
      const secret = process.env.WHATSAPP_WEBHOOK_SECRET || "";

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
        },
        body: JSON.stringify({
          recipient,
          message,
          timestamp: new Date().toISOString(),
          hotel: HOTEL_CONFIG.name,
        }),
      });

      if (res.ok) {
        return { success: true, provider: "custom_webhook" };
      }
    }

    // 5. FALLBACK / AUDIT LOG
    console.log(
      `\n==================== [HOTEL PUNTO APARTE - WHATSAPP NOTIFICATION] ====================\n` +
      `DESTINATARIO: +${recipient}\n` +
      `MENSAJE:\n${message}\n` +
      `ENLACE WA.ME: https://wa.me/${recipient}?text=${encodeURIComponent(message)}\n` +
      `=======================================================================================\n`
    );

    return {
      success: true,
      provider: "logger_fallback",
      messageId: `log_${Date.now()}`,
    };
  } catch (error) {
    console.error("[WHATSAPP NOTIFIER] Error:", error);
    return {
      success: false,
      provider: "error",
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Notifica al WhatsApp del Hotel sobre una nueva reserva
 */
export async function sendBookingNotificationToHotel(
  data: BookingNotificationData
): Promise<{ success: boolean; message: string; waLink: string }> {
  const messageText = formatBookingWhatsAppMessage(data);
  const waLink = `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(messageText)}`;

  sendWhatsAppNotification(messageText).catch((err) =>
    console.error("[WHATSAPP] Falló envío en background:", err)
  );

  return {
    success: true,
    message: messageText,
    waLink,
  };
}

/**
 * Notifica al WhatsApp del Hotel sobre un pago aprobado
 */
export async function sendPaymentApprovalNotificationToHotel(
  data: PaymentApprovalData
): Promise<{ success: boolean; message: string; waLink: string }> {
  const messageText = formatPaymentApprovalWhatsAppMessage(data);
  const waLink = `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(messageText)}`;

  sendWhatsAppNotification(messageText).catch((err: unknown) =>
    console.error("[WHATSAPP] Falló envío en background:", err)
  );

  return {
    success: true,
    message: messageText,
    waLink,
  };
}

/**
 * Envía automáticamente la Factura Oficial & Comprobante Pagado al WhatsApp del Huésped
 */
export async function sendPaidInvoiceWhatsAppToCustomer(reservation: {
  reference: string;
  customerName: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  items: Array<{ quantity: number; roomName?: string; roomId?: string }>;
  totalAmount?: number;
}): Promise<{
  success: boolean;
  deliveredAutomatically: boolean;
  provider: string;
  waLink: string;
  message: string;
  error?: string;
}> {
  const cleanPhone = (reservation.phone || "").replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;

  const itemsFormatted = (reservation.items || [])
    .map((i) => `• ${i.quantity}x ${i.roomName || i.roomId}`)
    .join("\n");

  const message =
    `*FACTURA OFICIAL & CONFIRMACIÓN DE RESERVA*\n` +
    `*${HOTEL_CONFIG.name.toUpperCase()} — Quibdó, Chocó*\n\n` +
    `*Factura N°:* ${reservation.reference}\n` +
    `*Estado:* PAGADA Y CONFIRMADA (Comprobante Verificado)\n` +
    `*Fecha de Validación:* ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}\n\n` +
    `----------------------------------------\n` +
    `*DATOS DEL HUÉSPED*\n` +
    `• *Nombre:* ${reservation.customerName}\n` +
    (reservation.documentNumber ? `• *Documento:* ${reservation.documentType || "CC"} ${reservation.documentNumber}\n` : "") +
    (reservation.email ? `• *Email:* ${reservation.email}\n` : "") +
    `\n----------------------------------------\n` +
    `*DETALLES DE LA ESTANCIA CONFIRMADA*\n` +
    `• *Check-in:* ${reservation.checkIn} (Desde las 3:00 PM)\n` +
    `• *Check-out:* ${reservation.checkOut} (Hasta la 1:00 PM)\n` +
    `• *Duración:* ${reservation.nights || 1} ${(reservation.nights || 1) === 1 ? "noche" : "noches"}\n\n` +
    `*Acomodación:* \n${itemsFormatted}\n\n` +
    `----------------------------------------\n` +
    `*PAGO ACREDITADO:* *$ ${(reservation.totalAmount || 0).toLocaleString("es-CO")} COP*\n` +
    `• *Medio:* Cuenta de Ahorros Bancolombia (298-530084-33)\n` +
    `• *Titular:* José Raúl Gómez Botero\n` +
    `----------------------------------------\n\n` +
    `*¡Su reserva está 100% GARANTIZADA! Presente este comprobante digital o su documento de identidad en la recepción del hotel al momento del check-in.*\n\n` +
    `*Hotel Punto Aparte · Pasaje Peatonal Alameda Reyes · WhatsApp Oficial: +57 301 894 0859*`;

  const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

  let dispatchResult: { success: boolean; provider: string; messageId?: string; error?: string } = {
    success: false,
    provider: "none",
  };

  if (cleanPhone) {
    try {
      dispatchResult = await sendWhatsAppNotification(message, formattedPhone);
    } catch (err: unknown) {
      dispatchResult = {
        success: false,
        provider: "error",
        error: err instanceof Error ? err.message : "Error de red",
      };
    }
  }

  const deliveredAutomatically =
    dispatchResult.success &&
    dispatchResult.provider !== "logger_fallback" &&
    dispatchResult.provider !== "error" &&
    dispatchResult.provider !== "none";

  return {
    success: true,
    deliveredAutomatically,
    provider: dispatchResult.provider,
    error: dispatchResult.error,
    waLink,
    message,
  };
}

