import React from "react";
import { formatCOP } from "@/data/rooms";
import { HOTEL_CONFIG } from "@/data/config";
import { HOTEL_PAYMENT_ACCOUNTS } from "@/data/payments";
import { MapPin, Phone, Mail, ShieldCheck, CheckCircle2, Clock } from "lucide-react";

export interface InvoiceItemData {
  name: string;
  category?: string;
  quantity: number;
  pricePerNight?: number;
  totalPrice?: number;
}

export interface OfficialInvoiceProps {
  invoiceId: string;
  createdAt: string;
  paymentStatus: "CONFIRMED" | "PENDING_WHATSAPP" | "CANCELLED" | string;
  customerName: string;
  documentType?: string;
  documentNumber?: string;
  documentId?: string;
  phone?: string;
  email?: string;
  specialRequests?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  items: InvoiceItemData[];
  totalAmount: number;
  paymentMethodLabel?: string;
  className?: string;
}

export default function OfficialInvoiceDocument({
  invoiceId,
  createdAt,
  paymentStatus,
  customerName,
  documentType = "CC",
  documentNumber,
  documentId,
  phone,
  email,
  specialRequests,
  checkIn,
  checkOut,
  nights,
  items,
  totalAmount,
  paymentMethodLabel = "Cuenta de Ahorros Bancolombia",
  className = "",
}: OfficialInvoiceProps) {
  const isConfirmed = paymentStatus === "CONFIRMED";
  const docFull = documentId || (documentNumber ? `${documentType} ${documentNumber}` : "No especificado");

  return (
    <div
      id="printable-invoice"
      className={`p-6 sm:p-8 rounded-3xl bg-dark-bg border border-white/15 text-neutral-light shadow-2xl space-y-6 text-xs transition-all ${className}`}
    >
      {/* 1. ENCABEZADO CORPORATIVO & MEMBRETE OFICIAL */}
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-white/15 pb-6">
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 font-extrabold text-base tracking-wider shrink-0 print-logo">
              PA
            </div>
            <div>
              <h2 className="font-heading text-2xl font-black text-white tracking-wide uppercase">
                {HOTEL_CONFIG.name}
              </h2>
              <span className="text-[11px] text-gold-400 font-semibold tracking-wider uppercase block">
                Hospedaje Elegante & Confort · RNT: 84920
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-gray flex items-center gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span>{HOTEL_CONFIG.fullAddress}</span>
          </p>
          <p className="text-[11px] text-neutral-gray flex flex-wrap gap-x-3 gap-y-1">
            <span>WhatsApp: <strong className="text-white">{HOTEL_CONFIG.whatsappFormatted}</strong></span>
            <span>· Correo: <strong className="text-white">{HOTEL_CONFIG.corporateEmail}</strong></span>
          </p>
        </div>

        {/* Bloque Factura N° y Estado */}
        <div className="text-right sm:border-l sm:border-white/10 sm:pl-6 space-y-1.5 min-w-[200px]">
          <span className="text-[10px] font-black text-gold-400 uppercase tracking-widest block font-heading">
            FACTURA OFICIAL DE RESERVA
          </span>
          <span className="font-mono text-xl sm:text-2xl font-black text-white block tracking-wider">
            {invoiceId}
          </span>
          <span className="text-[11px] text-neutral-gray block">
            Emisión: {createdAt}
          </span>
          <div className="pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider ${
                isConfirmed
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}
            >
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ESTADO: PAGADA Y CONFIRMADA</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>ESTADO: PENDIENTE DE PAGO</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 2. DATOS DEL HUÉSPED & DETALLES DE LA ESTANCIA (2 COLUMNAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="space-y-1.5">
          <span className="text-gold-400 uppercase font-black text-[10px] tracking-wider block">
            DATOS DEL HUÉSPED TITULAR
          </span>
          <p className="text-white font-bold text-sm tracking-wide">{customerName}</p>
          <p className="text-neutral-light font-mono text-[11px]">
            <strong className="text-neutral-gray font-sans">Documento:</strong> {docFull}
          </p>
          {phone && (
            <p className="text-neutral-gray text-[11px]">
              <strong className="text-neutral-light">Teléfono / WhatsApp:</strong> {phone}
            </p>
          )}
          {email && (
            <p className="text-neutral-gray text-[11px]">
              <strong className="text-neutral-light">Correo:</strong> {email}
            </p>
          )}
          {specialRequests && specialRequests.trim() && (
            <p className="text-gold-300/90 italic pt-1 text-[11px]">
              &ldquo;{specialRequests}&rdquo;
            </p>
          )}
        </div>

        <div className="space-y-1.5 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
          <span className="text-gold-400 uppercase font-black text-[10px] tracking-wider block">
            DETALLES DE LA ESTANCIA
          </span>
          <p className="text-white font-bold text-sm">
            {checkIn} al {checkOut}
          </p>
          <p className="text-neutral-gray text-[11px]">
            Duración: <strong className="text-white">{nights}</strong> {nights === 1 ? "noche" : "noches"}
          </p>
          <p className="text-neutral-gray text-[11px]">
            Check-in: <strong className="text-white">3:00 PM</strong> | Check-out: <strong className="text-white">1:00 PM</strong>
          </p>
          <p className="text-neutral-gray text-[11px]">
            Medio de Pago: <strong className="text-white">{paymentMethodLabel}</strong>
          </p>
        </div>
      </div>

      {/* 3. TABLA DETALLADA DE HABITACIONES Y TARIFAS */}
      <div className="border border-white/15 rounded-2xl overflow-hidden shadow-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/10 text-gold-400 uppercase font-bold border-b border-white/15">
            <tr>
              <th className="p-3.5">Habitación / Categoría</th>
              <th className="p-3.5 text-center">Cant.</th>
              <th className="p-3.5 text-right">Tarifa / Noche</th>
              <th className="p-3.5 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-white/90">
            {items.map((item, index) => {
              const pricePerNight = item.pricePerNight || (item.totalPrice ? Math.round(item.totalPrice / (item.quantity * nights)) : 0);
              const subtotal = item.totalPrice || pricePerNight * item.quantity * nights;

              return (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-white block text-sm">{item.name}</span>
                    {item.category && <span className="text-[11px] text-neutral-gray">{item.category}</span>}
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold text-sm">{item.quantity}</td>
                  <td className="p-3.5 text-right font-mono text-neutral-light">{formatCOP(pricePerNight)}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-gold-400 text-sm">
                    {formatCOP(subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. TOTAL LIQUIDADO & CUENTA BANCOLOMBIA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="font-bold text-yellow-300 text-xs block uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            Cuenta Oficial Bancolombia:
          </span>
          <span className="font-mono text-lg font-bold text-white block tracking-wider">
            {HOTEL_PAYMENT_ACCOUNTS.accountNumberFormatted}
          </span>
          <span className="text-[11px] text-neutral-gray block">
            Titular: <strong className="text-white">{HOTEL_PAYMENT_ACCOUNTS.beneficiaryName}</strong> (Cuenta de Ahorros)
          </span>
        </div>

        <div className="text-right">
          <span className="text-neutral-gray text-xs block font-semibold uppercase">TOTAL LIQUIDADO:</span>
          <span className="font-heading text-2xl sm:text-3xl font-black text-yellow-400 block invoice-total-amount">
            {formatCOP(totalAmount)}
          </span>
          <span className="text-[10px] text-neutral-gray">Impuestos y servicios incluidos</span>
        </div>
      </div>

      {/* 5. TÉRMINOS LEGALES, POLÍTICAS Y FIRMAS DE CONFORMIDAD */}
      <div className="pt-4 border-t border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-neutral-gray leading-relaxed">
          <div>
            <p className="font-semibold text-neutral-light mb-0.5">Políticas de Check-in & Estadía:</p>
            <p>• Presentar documento de identidad original (Cédula o Pasaporte) en recepción.</p>
            <p>• Check-in a partir de las 3:00 PM · Check-out límite a la 1:00 PM.</p>
            <p>• Edificación con Certificación Antisísmica y atención 24 horas.</p>
          </div>
          <div className="sm:text-right">
            <p className="font-semibold text-neutral-light mb-0.5">Garantía y Legalidad:</p>
            <p>• Cumplimiento con Ley 300 de 1996 y Ley 2068 de 2020 de Turismo de Colombia.</p>
            <p>• Comprobante oficial de reserva emitido por el sistema Hotel Punto Aparte Quibdó.</p>
          </div>
        </div>

        {/* Firmas en Impresión */}
        <div className="hidden print-signatures pt-8 grid grid-cols-2 gap-12 text-center text-xs text-neutral-dark">
          <div className="border-t border-black pt-2">
            <p className="font-bold">Recepción / Gerencia</p>
            <p className="text-[10px] text-neutral-gray">{HOTEL_CONFIG.name} — Quibdó</p>
          </div>
          <div className="border-t border-black pt-2">
            <p className="font-bold">Firma del Huésped Titular</p>
            <p className="text-[10px] text-neutral-gray">{customerName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
