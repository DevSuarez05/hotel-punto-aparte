import { NextResponse } from "next/server";
import { calculateAvailability } from "@/lib/inventory";
import { getDefaultDates } from "@/context/CartContext";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const defaults = getDefaultDates();
    const checkIn = searchParams.get("checkIn") || defaults.checkIn;
    const checkOut = searchParams.get("checkOut") || defaults.checkOut;

    const result = calculateAvailability(checkIn, checkOut);

    return NextResponse.json({
      success: true,
      ...result,
    });
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

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error en API de Disponibilidad POST:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar la disponibilidad" },
      { status: 500 }
    );
  }
}
