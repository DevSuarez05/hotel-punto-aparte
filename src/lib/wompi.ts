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
    process.env.WOMPI_INTEGRITY_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRITICAL_SECURITY_ERROR: WOMPI_INTEGRITY_EVENTS_SECRET no está configurada en producción."
      );
    }
  }

  const effectiveSecret = secret || "dev_sandbox_integrity_secret_punto_aparte";
  const rawString = expirationTime
    ? `${reference}${amountInCents}${currency}${expirationTime}${effectiveSecret}`
    : `${reference}${amountInCents}${currency}${effectiveSecret}`;

  return crypto.createHash("sha256").update(rawString).digest("hex");
}

/**
 * Valida la firma de un evento Webhook enviado por Wompi mediante SHA-256
 * usando comparación en tiempo constante (timingSafeEqual) para prevenir ataques de temporización.
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
  if (!receivedChecksum || typeof receivedChecksum !== "string") {
    return false;
  }

  const secret =
    eventsSecret ||
    process.env.WOMPI_INTEGRITY_EVENTS_SECRET ||
    process.env.WOMPI_EVENTS_SECRET ||
    process.env.WOMPI_INTEGRITY_KEY;

  if (!secret) {
    console.error(
      "[WOMPI SECURITY] Error: Secreto de webhook no configurado. Rechazando verificación por seguridad."
    );
    if (process.env.NODE_ENV === "production") {
      return false;
    }
  }

  const effectiveSecret = secret || "dev_sandbox_integrity_secret_punto_aparte";
  const rawString = `${reference}${amountInCents}${currency}${status}${timestamp}${effectiveSecret}`;
  const calculatedChecksum = crypto.createHash("sha256").update(rawString).digest("hex");

  try {
    const calcBuf = Buffer.from(calculatedChecksum.toLowerCase(), "utf8");
    const recvBuf = Buffer.from(receivedChecksum.toLowerCase(), "utf8");

    if (calcBuf.length !== recvBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(calcBuf, recvBuf);
  } catch (error) {
    console.error("[WOMPI SECURITY] Error durante comparación criptográfica:", error);
    return false;
  }
}
