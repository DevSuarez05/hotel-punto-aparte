import { HOTEL_CONFIG } from "@/data/config";
import { HOTEL_PAYMENT_ACCOUNTS } from "@/data/payments";

export interface BookingCustomer {
  fullName: string;
  documentType: string;
  documentNumber: string;
  documentId?: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface BookingItem {
  id: string;
  name: string;
  quantity: number;
  pricePerNight: number;
  totalPrice: number;
}

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

export interface StoredReservation {
  id: string;
  reference: string;
  customerName: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  paymentMethod?: string;
  specialRequests?: string;
  totalAmount?: number;
  items: Array<{
    roomId: string;
    roomName?: string;
    quantity: number;
    pricePerNight?: number;
  }>;
  checkIn: string;
  checkOut: string;
  nights?: number;
  status: "CONFIRMED" | "PENDING_WHATSAPP" | "CANCELLED" | "EXPIRED";
  createdAt: string;
}

const STORAGE_KEY = "hotel_punto_aparte_reservations";

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

export function buildBookingWhatsAppUrl(data: BookingNotificationData): string {
  const message = formatBookingWhatsAppMessage(data);
  return `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(message)}`;
}

export function getStoredReservations(seed: StoredReservation[] = []): StoredReservation[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (seed && seed.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

export function saveStoredReservation(reservation: StoredReservation): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredReservations();
    const updated = [reservation, ...current.filter((r) => r.reference !== reservation.reference)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Error guardando en localStorage:", err);
  }
}

export function updateStoredReservationStatus(
  reference: string,
  newStatus: "CONFIRMED" | "CANCELLED" | "PENDING_WHATSAPP"
): StoredReservation[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredReservations();
    const updated = current.map((r) =>
      r.reference === reference ? { ...r, status: newStatus } : r
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error actualizando status en localStorage:", err);
    return [];
  }
}
