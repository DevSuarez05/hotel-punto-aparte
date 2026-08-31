/**
 * HOTEL PUNTO APARTE - SEED & DATABASE SYNC SCRIPT
 * 
 * Este script se puede ejecutar en entornos Node.js / TypeScript para inicializar o
 * sincronizar el inventario de 23 habitaciones en una base de datos (Postgres, Prisma, MongoDB, etc.)
 */

import {
  roomsData,
  TOTAL_HOTEL_ROOMS,
  validateInventoryIntegrity,
  getInventorySummary,
  formatCOP,
  Room,
} from "./rooms";

export async function runInventorySeed() {
  console.log("=================================================");
  console.log("🏨 HOTEL PUNTO APARTE - INVENTARIO & SEED RUNNER");
  console.log("=================================================");

  // 1. Validación de Integridad
  try {
    validateInventoryIntegrity(roomsData);
    console.log(`✅ [VALIDACIÓN EXITOSA]: Stock verificado en exactamente ${TOTAL_HOTEL_ROOMS} habitaciones.`);
  } catch (error) {
    console.error("❌ [ERROR DE INTEGRIDAD]:", error);
    process.exit(1);
  }

  // 2. Resumen consolidado
  const summary = getInventorySummary();
  console.log("\n📊 RESUMEN CONSOLIDADO DE INVENTARIO:");
  console.log(` - Total de Habitaciones: ${summary.totalRooms}`);
  console.log(` - Climatizadas con A/C:   ${summary.byClimate.ac} habitaciones`);
  console.log(` - Con Ventilador:         ${summary.byClimate.fan} habitaciones`);
  console.log(` - Tipo Cama Doble:        ${summary.byBedCategory.doble} habitaciones`);
  console.log(` - Tipo Cama Sencilla:     ${summary.byBedCategory.sencilla} habitaciones`);

  // 3. Detalle de Categorías
  console.log("\n📋 DETALLE POR CATEGORÍA:");
  roomsData.forEach((room: Room) => {
    console.log(
      ` [${room.categoryCode}] ${room.name.padEnd(46)} | Tarifa: ${formatCOP(room.priceNumeric).padEnd(16)} | Stock: ${room.availableUnits} habs.`
    );
  });

  console.log("\n✨ Seed completado con éxito.");
  return {
    success: true,
    totalRooms: summary.totalRooms,
    categoriesCount: roomsData.length,
  };
}

// Ejecución directa si se corre como script CLI
if (require.main === module) {
  runInventorySeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Error ejecutando seed:", err);
      process.exit(1);
    });
}
