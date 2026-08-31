/**
 * ============================================================================
 * HELPER PARA CARGA Y EJECUCIÓN DEL WIDGET NATIVO DE WOMPI BANCOLOMBIA
 * ============================================================================
 */

export interface WompiCustomerData {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  phoneNumberPrefix?: string;
  legalId?: string;
  legalIdType?: string;
}

export interface WompiWidgetConfig {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  signature?: { integrity: string };
  redirectUrl?: string;
  customerData?: WompiCustomerData;
}

export interface WompiTransactionResult {
  transaction: {
    id: string;
    status: "APPROVED" | "DECLINED" | "VOIDED" | "PENDING" | "ERROR";
    reference: string;
    amountInCents?: number;
    currency?: string;
    paymentMethodType?: string;
  };
}

declare global {
  interface Window {
    WidgetCheckout?: new (config: WompiWidgetConfig) => {
      open: (callback: (result: WompiTransactionResult) => void) => void;
    };
  }
}

/**
 * Sanitiza y extrae el número de teléfono y el prefijo de país para Wompi
 */
export function sanitizePhoneForWompi(rawPhone?: string): {
  phoneNumber: string;
  phoneNumberPrefix: string;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      phoneNumber: "3018940859",
      phoneNumberPrefix: "+57",
    };
  }

  const cleanDigits = rawPhone.replace(/\D/g, "");

  // Si incluye código de país Colombia (57) al inicio
  if (cleanDigits.startsWith("57") && cleanDigits.length >= 12) {
    return {
      phoneNumber: cleanDigits.slice(2, 12),
      phoneNumberPrefix: "+57",
    };
  }

  // Si tiene 10 dígitos (formato estándar móvil Colombia ej. 3018940859)
  if (cleanDigits.length === 10) {
    return {
      phoneNumber: cleanDigits,
      phoneNumberPrefix: "+57",
    };
  }

  // Fallback con los dígitos limpios o número de contacto
  return {
    phoneNumber: cleanDigits.length >= 7 ? cleanDigits : "3018940859",
    phoneNumberPrefix: "+57",
  };
}

/**
 * Carga el script oficial de Wompi Widget de manera asíncrona y segura
 */
export function loadWompiScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.WidgetCheckout) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("wompi-widget-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "wompi-widget-script";
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("No se pudo cargar el script de Wompi Widget, usando fallback seguro.");
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

/**
 * Abre el Checkout Modal interactivo de Wompi con parámetros obligatorios sanitizados
 */
export async function openWompiCheckout(
  config: WompiWidgetConfig,
  onResult: (result: WompiTransactionResult) => void
): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  const loaded = await loadWompiScript();

  if (loaded && window.WidgetCheckout) {
    try {
      // Sanitización estricta de teléfono y campos obligatorios
      const { phoneNumber, phoneNumberPrefix } = sanitizePhoneForWompi(
        config.customerData?.phoneNumber
      );

      const sanitizedCustomerData: WompiCustomerData = {
        email: config.customerData?.email || "cliente@hotelpuntoaparte.com",
        fullName: config.customerData?.fullName || "Huésped Hotel Punto Aparte",
        phoneNumber: phoneNumber,
        phoneNumberPrefix: config.customerData?.phoneNumberPrefix || phoneNumberPrefix || "+57",
        legalId: config.customerData?.legalId || "1077458921",
        legalIdType: config.customerData?.legalIdType || "CC",
      };

      const finalConfig: WompiWidgetConfig = {
        currency: config.currency || "COP",
        amountInCents: config.amountInCents,
        reference: config.reference,
        publicKey:
          config.publicKey ||
          process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ||
          "pub_test_Q5yDA9xoKdePzhSGeVe9KStXTIIOxKKW",
        signature: config.signature,
        redirectUrl: config.redirectUrl,
        customerData: sanitizedCustomerData,
      };

      console.log("[WOMPI WIDGET CONFIG INICIALIZADA]:", {
        reference: finalConfig.reference,
        amountInCents: finalConfig.amountInCents,
        phoneNumberPrefix: sanitizedCustomerData.phoneNumberPrefix,
        phoneNumber: sanitizedCustomerData.phoneNumber,
      });

      const checkout = new window.WidgetCheckout(finalConfig);
      checkout.open((result: WompiTransactionResult) => {
        onResult(result);
      });
      return true;
    } catch (err) {
      console.error("Error abriendo WidgetCheckout:", err);
      return false;
    }
  }

  return false;
}
