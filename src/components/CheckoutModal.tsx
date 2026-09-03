"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Copy,
  ShieldCheck,
  Clock,
  CheckCheck,
  Download,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCOP, roomsData } from "@/data/rooms";
import { HOTEL_CONFIG } from "@/data/config";
import {
  DOCUMENT_TYPES,
  DocumentType,
  validateDocumentNumber,
  HOTEL_PAYMENT_ACCOUNTS,
} from "@/data/payments";
import OfficialInvoiceDocument from "./OfficialInvoiceDocument";
import { toast } from "sonner";
import {
  buildBookingWhatsAppUrl,
  saveStoredReservation,
  BookingNotificationData,
} from "@/lib/bookingClient";

interface InvoiceItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  pricePerNight: number;
  totalPrice: number;
}

interface InvoiceData {
  invoiceId: string;
  createdAt: string;
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  documentId: string;
  email: string;
  phone: string;
  specialRequests: string;
  paymentMethodLabel: string;
  paymentStatus: "PENDING_PAYMENT" | "CONFIRMED";
  checkIn: string;
  checkOut: string;
  nights: number;
  items: InvoiceItem[];
  totalAmount: number;
  whatsappLink: string;
}

export default function CheckoutModal() {
  const {
    items,
    checkIn,
    checkOut,
    isCheckoutOpen,
    setIsCheckoutOpen,
    totalNights,
    totalAmount: contextTotalAmount,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopiedAccount, setHasCopiedAccount] = useState(false);

  // Form Fields - Step 1
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Cálculo de noches garantizado
  const validNights = Math.max(1, totalNights || 1);

  const activeItems: InvoiceItem[] = useMemo(() => {
    if (items && items.length > 0) {
      return items.map((item) => {
        const itemNights = Math.max(1, item.nights || validNights);
        const itemQty = Math.max(1, item.quantity || 1);
        const itemPrice = item.room?.priceNumeric || 140000;
        return {
          id: item.room?.id || "doble-ac",
          name: item.room?.name || "Habitación Doble con Aire Acondicionado",
          category: item.room?.category || "Categoría A · Doble Confort A/C",
          quantity: itemQty,
          pricePerNight: itemPrice,
          totalPrice: itemPrice * itemQty * itemNights,
        };
      });
    }

    const defaultRoom = roomsData[0];
    return [
      {
        id: defaultRoom.id,
        name: defaultRoom.name,
        category: defaultRoom.category,
        quantity: 1,
        pricePerNight: defaultRoom.priceNumeric,
        totalPrice: defaultRoom.priceNumeric * validNights,
      },
    ];
  }, [items, validNights]);

  const activeTotalAmount = useMemo(() => {
    const sum = activeItems.reduce((acc, i) => acc + i.totalPrice, 0);
    return sum > 0 ? sum : contextTotalAmount > 0 ? contextTotalAmount : 140000 * validNights;
  }, [activeItems, contextTotalAmount, validNights]);

  // Validación de Documento en tiempo real
  const currentDocTypeConfig = useMemo(() => {
    return DOCUMENT_TYPES.find((d) => d.value === documentType) || DOCUMENT_TYPES[0];
  }, [documentType]);

  const docValidation = useMemo(() => {
    return validateDocumentNumber(documentType, documentNumber);
  }, [documentType, documentNumber]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(HOTEL_PAYMENT_ACCOUNTS.accountNumber);
    setHasCopiedAccount(true);
    toast.success("Número de cuenta copiado", {
      description: "29853008433 listo para transferir en Bancolombia o Nequi.",
    });
    setTimeout(() => setHasCopiedAccount(false), 3000);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (step === 3) {
      clearCart();
      setStep(1);
      setInvoice(null);
    }
  };

  // Validar y avanzar de Paso 1 a Paso 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Nombre requerido", { description: "Por favor ingresa tu nombre completo." });
      return;
    }

    if (!docValidation.isValid) {
      toast.error("Documento inválido", { description: docValidation.message });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Correo inválido", { description: "Por favor ingresa un correo electrónico válido." });
      return;
    }

    if (!phone.trim()) {
      toast.error("Teléfono requerido", { description: "Por favor ingresa tu número telefónico o WhatsApp." });
      return;
    }

    setStep(2);
  };

  // CONFIRMACIÓN Y ENVÍO DIRECTO A WHATSAPP CON PERSISTENCIA LOCAL (EXPORTACIÓN ESTÁTICA)
  const handleConfirmReservation = () => {
    setIsSubmitting(true);

    const docFormatted = `${documentType} ${documentNumber}`.trim();
    const finalAmount = activeTotalAmount;

    try {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const invoiceId = `FACT-${year}-${randomNum}`;
      const createdAt = new Date().toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const paymentMethodLabel = "Cuenta de Ahorros Bancolombia";

      const bookingData: BookingNotificationData = {
        invoiceId,
        fullName,
        documentType,
        documentNumber,
        documentId: docFormatted,
        email,
        phone,
        specialRequests,
        checkIn,
        checkOut,
        nights: validNights,
        items: activeItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          pricePerNight: item.pricePerNight,
          totalPrice: item.totalPrice,
        })),
        totalAmount: finalAmount,
        paymentMethodLabel,
        createdAt,
      };

      const whatsappLink = buildBookingWhatsAppUrl(bookingData);

      // Persistir en almacenamiento local para el panel de administración
      saveStoredReservation({
        id: `RES-${Date.now()}-${randomNum}`,
        reference: invoiceId,
        customerName: fullName,
        documentType,
        documentNumber,
        phone,
        email,
        paymentMethod: paymentMethodLabel,
        specialRequests,
        totalAmount: finalAmount,
        items: activeItems.map((it) => ({
          roomId: it.id,
          roomName: it.name,
          quantity: it.quantity,
          pricePerNight: it.pricePerNight,
        })),
        checkIn,
        checkOut,
        nights: validNights,
        status: "PENDING_WHATSAPP",
        createdAt: new Date().toISOString(),
      });

      const newInvoice: InvoiceData = {
        invoiceId,
        createdAt,
        fullName,
        documentType,
        documentNumber,
        documentId: docFormatted,
        email,
        phone,
        specialRequests,
        paymentMethodLabel,
        paymentStatus: "PENDING_PAYMENT",
        checkIn,
        checkOut,
        nights: validNights,
        items: activeItems,
        totalAmount: finalAmount,
        whatsappLink,
      };

      setInvoice(newInvoice);
      setStep(3);

      toast.success("¡Reserva registrada con éxito!", {
        description: "Abriendo WhatsApp para enviar los datos de la reserva...",
      });

      // Abrir WhatsApp oficial en nueva pestaña
      setTimeout(() => {
        window.open(whatsappLink, "_blank", "noopener,noreferrer");
      }, 500);
    } catch (err: unknown) {
      console.error("Error al procesar reserva:", err);
      const msg = err instanceof Error ? err.message : "Error al procesar la solicitud";
      toast.error("Error en Reserva", {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayTotal =
    step === 3 && invoice ? invoice.totalAmount : activeTotalAmount;

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto glass-card border border-gold-500/30 rounded-3xl shadow-2xl shadow-black text-neutral-light"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (No print) */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-surface/60 sticky top-0 z-20 backdrop-blur-md no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white">
                {step === 3 ? "Factura & Comprobante Oficial" : "Checkout — Proceso de Reserva"}
              </h2>
              <span className="text-xs text-neutral-gray font-light">
                {HOTEL_CONFIG.name} · {HOTEL_CONFIG.city}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-gray hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper (No print) */}
        {step !== 3 && (
          <div className="px-6 py-4 bg-dark-bg/80 border-b border-white/5 flex items-center justify-center gap-4 text-xs font-semibold no-print">
            <div
              className={`flex items-center gap-2 ${
                step === 1 ? "text-gold-400 font-bold" : "text-emerald-400"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 1
                    ? "bg-gold-500 text-dark-bg font-bold"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                1
              </span>
              <span>Datos del Huésped</span>
            </div>

            <div className="w-8 h-0.5 bg-white/10" />

            <div
              className={`flex items-center gap-2 ${
                step === 2 ? "text-gold-400 font-bold" : "text-neutral-gray"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 2
                    ? "bg-gold-500 text-dark-bg font-bold"
                    : "bg-white/10 text-neutral-gray"
                }`}
              >
                2
              </span>
              <span>Pago Bancolombia & WhatsApp</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Reservation Summary Bar (No print in Step 1 & 2) */}
          {step !== 3 && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4 no-print">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gold-400" />
                <div className="text-xs">
                  <span className="text-neutral-gray block">Estancia Seleccionada:</span>
                  <span className="font-semibold text-white">
                    {checkIn} al {checkOut} ({validNights} {validNights === 1 ? "noche" : "noches"})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-gray block">Total a Pagar:</span>
                <span className="text-xl sm:text-2xl font-bold text-gold-gradient font-heading tracking-wide">
                  {formatCOP(currentDisplayTotal)}
                </span>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* PASO 1: DATOS DEL TITULAR                                        */}
          {/* ================================================================ */}
          {step === 1 && (
            <form onSubmit={handleProceedToStep2} className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <User className="w-5 h-5 text-gold-400" />
                <h3 className="font-heading text-lg font-bold text-white">
                  Información del Titular de Reserva
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Nombre Completo */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-gray block mb-1.5">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Daniel Andrés Suárez"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Tipo y Número de Documento */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-gray block">
                    Tipo y Número de Documento (Identificación Oficial) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5 relative">
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                        className="w-full bg-dark-bg border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-gold-500 transition-colors appearance-none cursor-pointer font-medium"
                      >
                        {DOCUMENT_TYPES.map((doc) => (
                          <option key={doc.value} value={doc.value} className="bg-dark-bg text-white">
                            {doc.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gold-400 text-xs">
                        ▼
                      </div>
                    </div>

                    <div className="sm:col-span-7 relative">
                      <input
                        type="text"
                        required
                        placeholder={currentDocTypeConfig.placeholder}
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none transition-colors ${
                          documentNumber
                            ? docValidation.isValid
                              ? "border-emerald-500/60 focus:border-emerald-400"
                              : "border-amber-500/60 focus:border-amber-400"
                            : "border-white/10 focus:border-gold-500"
                        }`}
                      />
                      {documentNumber && (
                        <div className="absolute right-3 top-3.5">
                          {docValidation.isValid ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold">Verificar</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-gray flex items-center justify-between pt-0.5">
                    <span>{currentDocTypeConfig.patternHelp}</span>
                    {documentNumber && !docValidation.isValid && (
                      <span className="text-amber-400">{docValidation.message}</span>
                    )}
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-gray block mb-1.5">
                    Correo Electrónico (Para envío de comprobante) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="tu.correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-gray block mb-1.5">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 301 894 0859"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Solicitudes Especiales */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-gray block mb-1.5">
                    Solicitudes Especiales / Nota de Llegada (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Hora aproximada de llegada, requerimientos de cama o información adicional..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Botón Siguiente */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-gold-gradient text-dark-bg font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                  <span>Revisar Cuenta y Confirmar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* PASO 2: CUENTA OFICIAL BANCOLOMBIA & CONFIRMAR EN WHATSAPP       */}
          {/* ================================================================ */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">
                      Cuenta Oficial — Bancolombia
                    </h3>
                    <span className="text-[11px] text-neutral-gray">
                      Único medio de pago oficial para confirmación inmediata
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modificar Datos</span>
                </button>
              </div>

              {/* Tarjeta Ejecutiva Bancolombia */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-950/40 via-dark-surface to-dark-bg border border-yellow-500/50 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center font-black text-base">
                      B
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Bancolombia
                      </span>
                      <span className="text-[11px] text-yellow-300 font-semibold">
                        Cuenta de Ahorros Oficial
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                    Cuenta Verificada
                  </span>
                </div>

                {/* Datos de la cuenta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-neutral-gray uppercase tracking-wider block font-semibold">
                        Número de Cuenta de Ahorros:
                      </span>
                      <span className="font-mono text-lg sm:text-xl font-bold text-white tracking-wider block mt-0.5">
                        {HOTEL_PAYMENT_ACCOUNTS.accountNumberFormatted}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-300 text-xs font-bold transition-all cursor-pointer shrink-0"
                    >
                      {hasCopiedAccount ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                    <span className="text-[10px] text-neutral-gray uppercase tracking-wider block font-semibold">
                      Titular de la Cuenta:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                      {HOTEL_PAYMENT_ACCOUNTS.beneficiaryName}
                    </span>
                    <span className="text-[11px] text-neutral-gray block mt-0.5">
                      Llave / WhatsApp: {HOTEL_CONFIG.whatsappDisplay}
                    </span>
                  </div>
                </div>

                {/* Monto a transferir */}
                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-neutral-gray uppercase tracking-wider block font-semibold">
                      Total a Transferir:
                    </span>
                    <span className="font-heading text-2xl sm:text-3xl font-black text-yellow-400 tracking-wide block mt-0.5">
                      {formatCOP(activeTotalAmount)}
                    </span>
                  </div>

                  <span className="text-xs text-yellow-300/90 font-medium">
                    ({validNights} {validNights === 1 ? "noche" : "noches"} de alojamiento)
                  </span>
                </div>

                {/* Paso a paso */}
                <div className="p-3.5 rounded-xl bg-white/5 text-xs text-neutral-light/90 space-y-1.5">
                  <p className="font-semibold text-white">Instrucciones para confirmar tu reserva:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-gray leading-relaxed font-light">
                    <li>Transfiere desde tu App Bancolombia o Nequi a la cuenta de ahorros indicada.</li>
                    <li>Haz clic en el botón verde para enviar los datos de la reserva al WhatsApp oficial.</li>
                    <li>Adjunta el comprobante de transferencia en el chat y la recepción confirmará tu estancia.</li>
                  </ol>
                </div>
              </div>

              {/* Botones de acción Paso 2 */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-white/15 text-neutral-gray hover:text-white transition-colors text-xs font-semibold cursor-pointer"
                >
                  Regresar a Datos
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmReservation}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-black text-sm sm:text-base shadow-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-80"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                      <span>Registrando y abriendo WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                      <span>Confirmar Reserva por WhatsApp ({formatCOP(activeTotalAmount)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* PASO 3: FACTURA OFICIAL & ESTADOS DE PAGO                        */}
          {/* ================================================================ */}
          {step === 3 && invoice && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              {/* Banner de Estado Visual (No print) */}
              <div
                className={`p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 no-print ${
                  invoice.paymentStatus === "CONFIRMED"
                    ? "bg-emerald-950/50 border-emerald-500/60 shadow-lg shadow-emerald-950/40"
                    : "bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/40"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      invoice.paymentStatus === "CONFIRMED"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {invoice.paymentStatus === "CONFIRMED" ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {invoice.paymentStatus === "CONFIRMED"
                        ? "¡Reserva Pagada & 100% Confirmada!"
                        : "¡Reserva Registrada — Pendiente de Pago!"}
                    </h3>
                    <p className="text-xs text-neutral-light/90 font-light mt-0.5">
                      {invoice.paymentStatus === "CONFIRMED"
                        ? "El pago ha sido acreditado en Bancolombia. Tu habitación está garantizada."
                        : `Factura N° ${invoice.invoiceId} por ${formatCOP(invoice.totalAmount)}. Envía tu comprobante para confirmar.`}
                    </p>
                  </div>
                </div>

                {/* Badge Oficial del Estado de Reserva */}
                <div className="flex items-center">
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                      invoice.paymentStatus === "CONFIRMED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                    }`}
                  >
                    {invoice.paymentStatus === "CONFIRMED" ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5" />
                        PAGADA Y CONFIRMADA
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        PENDIENTE DE PAGO
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* FACTURA IMPRIMIBLE AISLADA Y PROFESIONAL */}
              <OfficialInvoiceDocument
                invoiceId={invoice.invoiceId}
                createdAt={invoice.createdAt}
                paymentStatus={invoice.paymentStatus}
                customerName={invoice.fullName}
                documentType={invoice.documentType}
                documentNumber={invoice.documentNumber}
                documentId={invoice.documentId}
                phone={invoice.phone}
                email={invoice.email}
                specialRequests={invoice.specialRequests}
                checkIn={invoice.checkIn}
                checkOut={invoice.checkOut}
                nights={invoice.nights}
                items={invoice.items}
                totalAmount={invoice.totalAmount}
                paymentMethodLabel={invoice.paymentMethodLabel}
              />

              {/* Botones de Acción Posterior (No print) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 no-print">
                <a
                  href={invoice.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>
                    {invoice.paymentStatus === "CONFIRMED"
                      ? "Reenviar Confirmación a WhatsApp"
                      : "Enviar Comprobante a WhatsApp (+57 301 894 0859)"}
                  </span>
                </a>

                {/* Botón Descargar Factura (Bloqueado si está pendiente, habilitado si está confirmada) */}
                {invoice.paymentStatus === "CONFIRMED" ? (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-950/40"
                    title="Descargar Factura Oficial en PDF"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Descargar Factura</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      toast.info("Descarga No Disponible Aún", {
                        description:
                          "La descarga de la factura oficial se habilitará automáticamente una vez la recepción confirme tu pago en Bancolombia.",
                        duration: 6000,
                      });
                    }}
                    className="inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-gray hover:text-white font-semibold text-xs transition-all cursor-pointer opacity-75"
                    title="Descarga bloqueada: Pendiente de confirmación de pago"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Descargar Factura</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="py-4 px-6 rounded-2xl bg-gold-gradient text-dark-bg font-bold text-xs shadow-lg hover:opacity-95 transition-all cursor-pointer"
                >
                  Finalizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
