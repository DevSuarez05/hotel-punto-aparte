import crypto from "crypto";

/**
 * ============================================================================
 * UTILIDADES Y FIRMAS CRIPTOGRÁFICAS DE SEGURIDAD PARA WOMPI (BANCOLOMBIA)
 * ============================================================================
 */

export interface WompiTransactionPayload {
  reference: string;
  amountInCents: number;
  currency: string;
  customerEmail: string;
  customerFullName: string;
  customerPhone: string;
  documentType: string;
  documentNumber: string;
  redirectUrl?: string;
  expirationTime?: string;
}

export interface WompiCheckoutData {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signature: string;
  redirectUrl: string;
  checkoutUrl: string;
}

/**
 * Genera la firma de integridad requerida por Wompi mediante SHA-256.
 * Fórmula oficial: SHA256(reference + amount_in_cents + currency + [expiration_time] + integrity_secret)
 */
export function generateWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string = "COP",
  expirationTime?: string,
  integritySecret?: string
): string {
  const secret =
    integritySecret ||
    process.env.WOMPI_INTEGRITY_EVENTS_SECRET ||
    process.env.WOMPI_INTEGRITY_KEY ||
    "test_integrity_4C0L0MB1A_PUNT0APART3_S3CR3T_K3Y";

  const rawString = expirationTime
    ? `${reference}${amountInCents}${currency}${expirationTime}${secret}`
    : `${reference}${amountInCents}${currency}${secret}`;

  return crypto.createHash("sha256").update(rawString).digest("hex");
}

/**
 * Valida la firma de un evento Webhook enviado por Wompi mediante SHA-256.
 * Fórmula oficial Wompi Webhook: SHA256(properties.reference + properties.amount_in_cents + properties.currency + properties.status + timestamp + events_secret)
 */
export function verifyWompiWebhookSignature(
  reference: string,
  amountInCents: number,
  currency: string,
  status: string,
  timestamp: number | string,
  receivedChecksum: string,
  eventsSecret?: string
): boolean {
  const secret =
    eventsSecret ||
    process.env.WOMPI_INTEGRITY_EVENTS_SECRET ||
    process.env.WOMPI_EVENTS_SECRET ||
    process.env.WOMPI_INTEGRITY_KEY ||
    "test_events_4C0L0MB1A_PUNT0APART3_S3CR3T_K3Y";

  const rawString = `${reference}${amountInCents}${currency}${status}${timestamp}${secret}`;
  const calculatedChecksum = crypto.createHash("sha256").update(rawString).digest("hex");

  return calculatedChecksum.toLowerCase() === receivedChecksum.toLowerCase();
}
