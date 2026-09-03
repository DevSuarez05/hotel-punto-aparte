import { NextResponse } from "next/server";

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
    const { amount, bankCode, documentType, documentNumber, userEmail, userType } = body;

    if (!amount || !bankCode || !documentNumber || !userEmail) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos para procesar la transacción PSE" },
        { status: 400 }
      );
    }

    const transactionId = `PSE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const authorizationCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

    // Simulación de respuesta de pasarela segura (Wompi / PSE)
    return NextResponse.json({
      success: true,
      transactionId,
      authorizationCode,
      status: "APPROVED",
      bankCode,
      amount,
      currency: "COP",
      documentType,
      documentNumber,
      userType: userType || "N",
      bankUrl: `https://pse.redeban.com/sandbox/redirect?tx=${transactionId}`,
      timestamp: new Date().toISOString(),
      message: "Transacción aprobada satisfactoriamente por la entidad bancaria.",
    });
  } catch (error) {
    console.error("PSE Payment Gateway error:", error);
    return NextResponse.json(
      { success: false, error: "Error de comunicación con la pasarela PSE" },
      { status: 500 }
    );
  }
}
