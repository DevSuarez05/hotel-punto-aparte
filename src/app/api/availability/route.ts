import { NextResponse } from "next/server";
import { calculateAvailability } from "@/lib/inventory";
import { getDefaultDates } from "@/context/CartContext";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, ngrok-skip-browser-warning",
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const defaults = getDefaultDates();
    const checkIn = searchParams.get("checkIn") || defaults.checkIn;
    const checkOut = searchParams.get("checkOut") || defaults.checkOut;

    const result = calculateAvailability(checkIn, checkOut);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error en API de Disponibilidad GET:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar la disponibilidad" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const defaults = getDefaultDates();
    const checkIn = body.checkIn || defaults.checkIn;
    const checkOut = body.checkOut || defaults.checkOut;

    const result = calculateAvailability(checkIn, checkOut);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error en API de Disponibilidad POST:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar la disponibilidad" },
      { status: 500 }
    );
  }
}
