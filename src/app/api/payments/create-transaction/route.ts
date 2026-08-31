import { NextResponse } from "next/server";
import { generateWompiIntegritySignature } from "@/lib/wompi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount_in_cents,
      amount,
      currency = "COP",
      customer_email,
      customer_data,
      reference,
      redirect_url,
    } = body;

    // 1. Validar y calcular monto en centavos
    const finalAmountInCents =
      typeof amount_in_cents === "number"
        ? Math.round(amount_in_cents)
        : typeof amount === "number"
        ? Math.round(amount * 100)
        : null;

    if (!finalAmountInCents || finalAmountInCents <= 0) {
      return NextResponse.json(
        { success: false, error: "Monto inválido para procesar la transacción en centavos" },
        { status: 400 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Se requiere un número de referencia único (reference)" },
        { status: 400 }
      );
    }

    // Llave pública oficial de Wompi desde .env
    const publicKey =
      process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ||
      process.env.WOMPI_PUBLIC_KEY ||
      "pub_test_Q5yDA9xoKdePzhSGeVe9KStXTIIOxKKW";

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const envRedirectUrl = process.env.NEXT_PUBLIC_WOMPI_REDIRECT_URL;
    const finalRedirectUrl =
      redirect_url ||
      envRedirectUrl ||
      `${origin}/?payment_status=approved&reference=${encodeURIComponent(reference)}`;

    // 2. Generar firma de integridad HMAC-SHA256 oficial desde .env (WOMPI_INTEGRITY_EVENTS_SECRET)
    const integritySignature = generateWompiIntegritySignature(
      reference,
      finalAmountInCents,
      currency
    );

    // Sanitización de teléfono y prefijo obligatorio de Wompi (+57)
    const rawPhone = customer_data?.phone || "3018940859";
    const cleanDigits = rawPhone.replace(/\D/g, "");
    let sanitizedPhone = cleanDigits;
    if (cleanDigits.startsWith("57") && cleanDigits.length >= 12) {
      sanitizedPhone = cleanDigits.slice(2, 12);
    } else if (cleanDigits.length < 7) {
      sanitizedPhone = "3018940859";
    }

    // 3. Configuración estandarizada para Wompi Widget JS (Modal Nativo)
    const widgetConfig = {
      currency,
      amountInCents: finalAmountInCents,
      reference,
      publicKey,
      signature: {
        integrity: integritySignature,
      },
      redirectUrl: finalRedirectUrl,
      customerData: {
        email: customer_email || "cliente@hotelpuntoaparte.com",
        fullName: customer_data?.fullName || "Huésped Hotel Punto Aparte",
        phoneNumber: sanitizedPhone,
        phoneNumberPrefix: "+57",
        legalId: customer_data?.documentNumber || "1077458921",
        legalIdType: customer_data?.documentType || "CC",
      },
    };

    // 4. URL de respaldo estándar sin caracteres malformados
    const queryParams = new URLSearchParams();
    queryParams.set("public-key", publicKey);
    queryParams.set("currency", currency);
    queryParams.set("amount-in-cents", String(finalAmountInCents));
    queryParams.set("reference", reference);
    queryParams.set("signature:integrity", integritySignature);
    queryParams.set("redirect-url", finalRedirectUrl);

    const cleanCheckoutUrl = `https://checkout.wompi.co/p/?${queryParams.toString()}`;

    return NextResponse.json({
      success: true,
      data: {
        publicKey,
        currency,
        amountInCents: finalAmountInCents,
        amountCop: finalAmountInCents / 100,
        reference,
        signature: integritySignature,
        redirectUrl: finalRedirectUrl,
        checkoutUrl: cleanCheckoutUrl,
        widgetConfig,
        customer: {
          email: customer_email,
          fullName: customer_data?.fullName,
          phone: sanitizedPhone,
          phoneNumberPrefix: "+57",
          documentType: customer_data?.documentType || "CC",
          documentNumber: customer_data?.documentNumber || "",
        },
      },
    });
  } catch (error) {
    console.error("Error creating Wompi transaction:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al inicializar la pasarela Wompi" },
      { status: 500 }
    );
  }
}
