import nodemailer from "nodemailer";
import { HOTEL_CONFIG } from "@/data/config";
import { HOTEL_PAYMENT_ACCOUNTS } from "@/data/payments";
import { formatCOP } from "@/data/rooms";

/**
 * ============================================================================
 * SERVICIO DE EMAILS TRANSACCIONALES — HOTEL PUNTO APARTE
 * ============================================================================
 */

function getEmailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Envía el correo de solicitud de reserva (Pendiente de Pago en Bancolombia)
 */
export async function sendBookingPendingEmail(invoice: {
  invoiceId: string;
  fullName: string;
  email: string;
  documentType?: string;
  documentNumber?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  items: Array<{ name: string; quantity: number; pricePerNight: number; totalPrice: number }>;
  totalAmount: number;
  whatsappLink?: string;
}) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log(`[EMAIL] SMTP no configurado. Simulación de email pendiente enviado a: ${invoice.email}`);
    return { success: true, simulated: true };
  }

  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #333; color: #fff;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center; color: #fff;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; color: #f59e0b; font-weight: bold;">${formatCOP(item.totalPrice)}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0f1015; color: #e2e8f0; padding: 30px; max-width: 640px; margin: 0 auto; border-radius: 16px; border: 1px solid #2d3748;">
      <div style="text-align: center; border-bottom: 2px solid #d97706; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 26px; letter-spacing: 1px;">HOTEL PUNTO APARTE</h1>
        <p style="color: #a0aec0; font-size: 12px; margin-top: 5px;">Quibdó, Chocó · Pasaje Peatonal Alameda Reyes</p>
      </div>

      <div style="background-color: #2b1d0c; border: 1px solid #d97706; border-radius: 12px; padding: 16px; margin-bottom: 25px;">
        <span style="color: #f59e0b; font-weight: bold; font-size: 14px; text-transform: uppercase;">Estado: Pendiente de Pago</span>
        <p style="font-size: 13px; color: #fbd38d; margin: 6px 0 0 0;">Factura <strong>${invoice.invoiceId}</strong> generada exitosamente. Envía tu comprobante de Bancolombia para garantizar la habitación.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #f59e0b; font-size: 14px; text-transform: uppercase; margin-bottom: 10px;">Detalles de la Reserva</h3>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Huésped:</strong> ${invoice.fullName} (${invoice.documentType || "CC"} ${invoice.documentNumber || ""})</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Fechas:</strong> ${invoice.checkIn} al ${invoice.checkOut} (${invoice.nights} noches)</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Horarios:</strong> Check-in 3:00 PM | Check-out 1:00 PM</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
        <thead>
          <tr style="background-color: #1a202c; color: #d97706;">
            <th style="padding: 10px; text-align: left;">Habitación</th>
            <th style="padding: 10px; text-align: center;">Cant.</th>
            <th style="padding: 10px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background-color: #1a202c; border: 1px solid #4a5568; border-radius: 12px; padding: 18px; margin-bottom: 25px;">
        <h4 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 14px;">Cuenta Oficial de Pago — Bancolombia</h4>
        <p style="margin: 4px 0; font-size: 13px;">• <strong>Banco:</strong> Bancolombia (Cuenta de Ahorros)</p>
        <p style="margin: 4px 0; font-size: 15px; color: #fff;">• <strong>N° de Cuenta:</strong> <span style="font-family: monospace; font-weight: bold; color: #f59e0b;">${HOTEL_PAYMENT_ACCOUNTS.accountNumberFormatted}</span></p>
        <p style="margin: 4px 0; font-size: 13px;">• <strong>Titular:</strong> ${HOTEL_PAYMENT_ACCOUNTS.beneficiaryName}</p>
        <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: bold; color: #f59e0b; text-align: right;">TOTAL A PAGAR: ${formatCOP(invoice.totalAmount)}</p>
      </div>

      <div style="text-align: center; border-top: 1px solid #2d3748; padding-top: 20px;">
        <p style="font-size: 11px; color: #718096; margin: 0;">Hotel Punto Aparte · WhatsApp Oficial: +57 301 894 0859</p>
      </div>
    </div>
  `;

  try {
    const fromAddress = process.env.SMTP_FROM || `"Hotel Punto Aparte" <${process.env.SMTP_USER || "recepcion@hotelpuntoaparte.com"}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: invoice.email,
      subject: `Solicitud de Reserva ${invoice.invoiceId} — Hotel Punto Aparte Quibdó`,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("[EMAIL] Error enviando correo pendiente:", err);
    return { success: false, error: err };
  }
}

/**
 * Envía el correo de confirmación de pago oficial con la factura pagada
 */
export async function sendBookingConfirmedEmail(invoice: {
  reference: string;
  customerName: string;
  email: string;
  documentType?: string;
  documentNumber?: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  items: Array<{ quantity: number; roomName?: string; roomId?: string }>;
  totalAmount?: number;
}) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log(`[EMAIL] SMTP no configurado. Simulación de email confirmado enviado a: ${invoice.email}`);
    return { success: true, simulated: true };
  }

  const itemsList = (invoice.items || [])
    .map((i) => `<li><strong>${i.quantity}x</strong> ${i.roomName || i.roomId}</li>`)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0f1015; color: #e2e8f0; padding: 30px; max-width: 640px; margin: 0 auto; border-radius: 16px; border: 1px solid #2d3748;">
      <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="color: #10b981; margin: 0; font-size: 26px; letter-spacing: 1px;">HOTEL PUNTO APARTE</h1>
        <p style="color: #a0aec0; font-size: 12px; margin-top: 5px;">Quibdó, Chocó · Confirmación de Alojamiento Oficial</p>
      </div>

      <div style="background-color: #064e3b; border: 1px solid #10b981; border-radius: 12px; padding: 16px; margin-bottom: 25px; text-align: center;">
        <span style="color: #6ee7b7; font-weight: bold; font-size: 16px; text-transform: uppercase;">¡RESERVA 100% GARANTIZADA & PAGADA!</span>
        <p style="font-size: 13px; color: #d1fae5; margin: 6px 0 0 0;">Comprobante de pago verificado para la Factura <strong>${invoice.reference}</strong>.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: #10b981; font-size: 14px; text-transform: uppercase; margin-bottom: 10px;">Voucher de Hospedaje</h3>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Titular:</strong> ${invoice.customerName}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Documento:</strong> ${invoice.documentType || "CC"} ${invoice.documentNumber || ""}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Estancia:</strong> ${invoice.checkIn} al ${invoice.checkOut} (${invoice.nights || 1} noches)</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Check-in:</strong> Desde las 3:00 PM | <strong>Check-out:</strong> Hasta la 1:00 PM</p>
      </div>

      <div style="background-color: #1a202c; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <h4 style="color: #e2e8f0; margin: 0 0 8px 0; font-size: 13px;">Habitaciones Reservadas:</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #cbd5e0;">
          ${itemsList}
        </ul>
      </div>

      <div style="background-color: #1a202c; border: 1px solid #10b981; border-radius: 12px; padding: 16px; margin-bottom: 25px; text-align: right;">
        <span style="font-size: 12px; color: #a0aec0;">Total Acreditado:</span>
        <h2 style="color: #10b981; margin: 5px 0 0 0; font-size: 24px;">${formatCOP(invoice.totalAmount || 0)}</h2>
        <span style="font-size: 11px; color: #6ee7b7;">Acreditado a Cuenta de Ahorros Bancolombia</span>
      </div>

      <p style="font-size: 12px; color: #cbd5e0; line-height: 1.5; text-align: center;">
        Presenta este comprobante digital o tu documento de identidad en la recepción del hotel al momento de tu llegada en Quibdó.
      </p>

      <div style="text-align: center; border-top: 1px solid #2d3748; padding-top: 20px; margin-top: 25px;">
        <p style="font-size: 11px; color: #718096; margin: 0;">Hotel Punto Aparte · Calle 26 No. 5 - 37 Alameda Reyes · Quibdó, Chocó</p>
      </div>
    </div>
  `;

  try {
    const fromAddress = process.env.SMTP_FROM || `"Hotel Punto Aparte" <${process.env.SMTP_USER || "recepcion@hotelpuntoaparte.com"}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: invoice.email,
      subject: `¡Reserva Confirmada! Factura ${invoice.reference} — Hotel Punto Aparte Quibdó`,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("[EMAIL] Error enviando correo confirmado:", err);
    return { success: false, error: err };
  }
}
