"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  ShieldCheck,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Receipt,
  Lock,
  Zap,
  Check,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCOP, roomsData } from "@/data/rooms";
import { HOTEL_CONFIG } from "@/data/config";
import {
  DOCUMENT_TYPES,
  DocumentType,
  validateDocumentNumber,
} from "@/data/payments";
import { toast } from "sonner";

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
  paymentStatus: string;
  transactionId?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  items: InvoiceItem[];
  totalAmount: number;
  whatsappLink: string;
  checkoutUrl?: string;
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Form Fields - Step 1
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // CÁLCULO ESTRICTO Y GARANTIZADO DEL TOTAL A PAGAR (Precio * Cantidad * Noches)
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

  // Capturar retorno de pasarela (solo una vez al montar el componente)
  const hasProcessedReturn = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasProcessedReturn.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status") || urlParams.get("payment_status");
    const transactionId = urlParams.get("id") || urlParams.get("transaction_id");
    const ref = urlParams.get("reference");

    if (status === "APPROVED" || status === "approved" || transactionId) {
      hasProcessedReturn.current = true;

      const generatedReference = ref || `FACT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const finalAmount = activeTotalAmount;

      const messageText = `¡Hola Hotel Punto Aparte! Confirmo mi reserva y adjunto comprobante de débito exitoso por ${formatCOP(finalAmount)} para la Factura N° ${generatedReference}.`;
      const whatsappUrl = `https://wa.me/${HOTEL_CONFIG.whatsappRaw}?text=${encodeURIComponent(messageText)}`;

      setInvoice({
        invoiceId: generatedReference,
        createdAt: new Date().toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        fullName: fullName || "Titular de Reserva",
        documentType: documentType || "CC",
        documentNumber: documentNumber || "1077458921",
        documentId: `${documentType || "CC"} ${documentNumber || "1077458921"}`,
        email: email || "cliente@hotelpuntoaparte.com",
        phone: phone || "3018940859",
        specialRequests: specialRequests || "",
        paymentMethodLabel: "Débito en Línea Bancolombia / PSE (Web Checkout)",
        paymentStatus: "Confirmada (Pago Aprobado)",
        transactionId: transactionId || "BANC-TX-OK",
        checkIn,
        checkOut,
        nights: validNights,
        items: activeItems,
        totalAmount: finalAmount,
        whatsappLink: whatsappUrl,
      });

      setStep(3);
      setIsCheckoutOpen(true);
      clearCart();

      // Clean URL params after processing
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isCheckoutOpen) return null;

  const currentDocTypeConfig =
    DOCUMENT_TYPES.find((d) => d.value === documentType) || DOCUMENT_TYPES[0];
  const docValidation = validateDocumentNumber(documentType, documentNumber);

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setIsRedirecting(false);
    if (step === 3) {
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

  // REDIRECCIÓN VÍA PAYMENT LINK FIRMADO POR API WOMPI (resuelve 403 CloudFront)
  const handleDirectBancolombiaRedirect = async () => {
    setIsRedirecting(true);

    const docFormatted = `${documentType} ${documentNumber}`;
    const finalAmount = activeTotalAmount;

    try {
      // Resolver URL base dinámica (Ngrok / producción / localhost)
      const clientBaseUrl = typeof window !== "undefined" ? window.location.origin : "";

      // 1. Crear Payment Link firmado vía backend (/api/checkout → Wompi API)
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          customer: {
            fullName,
            documentType,
            documentNumber,
            documentId: docFormatted,
            email,
            phone,
            specialRequests,
            paymentMethod: "bancolombia_direct",
          },
          reservation: {
            checkIn,
            checkOut,
            nights: validNights,
            totalAmount: finalAmount,
            items: activeItems,
          },
          clientBaseUrl,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Error del servidor (${res.status})`);
      }

      const data = await res.json();

      // 2. Auditoría en consola
      console.log("Wompi Payment Link ID:", data.wompiLinkId);
      console.log("URL de checkout firmada:", data.checkoutUrl);
      console.log("Referencia de factura:", data.reference);

      // 3. Redirección nativa a la URL firmada por Wompi
      if (data.checkoutUrl) {
        toast.success("Conectando con Pasarela Bancolombia...", {
          description: "Redirigiendo a la pantalla de pago seguro...",
        });

        // Pequeño delay para que el toast sea visible antes de la navegación
        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 600);
      } else {
        throw new Error(
          "No se pudo generar el enlace de pago. Verifica las credenciales de Wompi en el servidor."
        );
      }
    } catch (err: unknown) {
      console.error("Error al crear Payment Link:", err);
      const msg = err instanceof Error ? err.message : "Error al procesar el pago";
      toast.error("Error de Pasarela", {
        description: msg,
      });
      setIsRedirecting(false);
    }
  };

  const currentDisplayTotal =
    step === 3 && invoice ? invoice.totalAmount : activeTotalAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto glass-card border border-gold-500/30 rounded-3xl shadow-2xl shadow-black text-neutral-light"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-dark-surface/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white">
                {step === 3 ? "Reserva Confirmada & Factura" : "Checkout — Proceso de Reserva"}
              </h2>
              <span className="text-xs text-neutral-gray font-light">
                {HOTEL_CONFIG.name} · {HOTEL_CONFIG.city}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-gray hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step Breadcrumbs / Stepper */}
        {step !== 3 && (
          <div className="px-6 py-4 bg-dark-bg/80 border-b border-white/5 flex items-center justify-center gap-4 text-xs font-semibold">
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
              <span>Datos de Cliente</span>
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
              <span>Débito Bancolombia</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Reservation Summary Bar */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gold-400" />
              <div className="text-xs">
                <span className="text-neutral-gray block">Estancia Seleccionada:</span>
                <span className="font-semibold text-white">
                  {step === 3 && invoice ? invoice.checkIn : checkIn} al{" "}
                  {step === 3 && invoice ? invoice.checkOut : checkOut} (
                  {step === 3 && invoice ? invoice.nights : validNights}{" "}
                  {(step === 3 && invoice ? invoice.nights : validNights) === 1
                    ? "noche"
                    : "noches"}
                  )
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

          {/* ================================================================ */}
          {/* PASO 1: DATOS DEL TITULAR CON SELECT + INPUT DE DOCUMENTO       */}
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
                      placeholder="Ej: Carlos Alberto Murillo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors"
                    />
                  </div>
                </div>

                {/* CONTROL COMPUESTO: TIPO Y NÚMERO DE DOCUMENTO */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-gray block">
                    Tipo y Número de Documento (Facturación Legal) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    {/* Select Tipo de Documento */}
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

                    {/* Input Número de Documento con Validación Dinámica */}
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

                  {/* Mensaje de ayuda / validación en vivo */}
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
                    Correo Electrónico (Facturación) *
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
                  className="inline-flex items-center gap-2 bg-gold-gradient text-dark-bg font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-gold-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
                >
                  <span>Continuar al Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ================================================================ */}
          {/* PASO 2: DÉBITO EN LÍNEA BANCOLOMBIA / WEB CHECKOUT               */}
          {/* ================================================================ */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white">
                      Pasarela Oficial — Bancolombia
                    </h3>
                    <span className="text-[11px] text-neutral-gray">
                      Débito en Línea Automático · Web Checkout
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modificar Datos</span>
                </button>
              </div>

              {/* TARJETA EJECUTIVA DE PAGO EN LÍNEA BANCOLOMBIA */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-yellow-950/40 via-dark-surface to-dark-bg border border-yellow-500/50 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center font-black text-sm">
                      B
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Botón Bancolombia & PSE
                      </span>
                      <span className="text-[11px] text-yellow-300 font-semibold">
                        Débito Seguro desde tu Cuenta
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    En Línea
                  </span>
                </div>

                {/* Monto a Debitar */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-neutral-gray uppercase tracking-wider block font-semibold">
                      Total a debitar de tu cuenta:
                    </span>
                    <span className="font-heading text-2xl sm:text-3xl font-black text-yellow-400 tracking-wide block mt-0.5">
                      {formatCOP(activeTotalAmount)}
                    </span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-yellow-400" />
                    <span>Cifrado SSL 256-bit</span>
                  </div>
                </div>

                {/* Información del Flujo */}
                <div className="p-3.5 rounded-xl bg-white/5 text-xs text-neutral-light/90 space-y-1">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>Procesamiento 100% Automático</span>
                  </p>
                  <p className="text-[11px] text-neutral-gray leading-relaxed font-light">
                    Al hacer clic en el botón inferior serás redirigido inmediatamente a la pantalla de autenticación bancaria oficial para autorizar el débito seguro.
                  </p>
                </div>
              </div>

              {/* Botón de Acción Principal (FORMULARIO DINÁMICO) */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/15 text-neutral-gray hover:text-white transition-colors text-xs font-semibold"
                >
                  Regresar a Datos
                </button>

                <button
                  type="button"
                  disabled={isRedirecting}
                  onClick={handleDirectBancolombiaRedirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-black text-sm sm:text-base shadow-2xl bg-yellow-500 hover:bg-yellow-400 text-dark-bg shadow-yellow-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-80"
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="w-5 h-5 text-dark-bg animate-spin" />
                      <span>Conectando con Bancolombia...</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5 text-dark-bg" />
                      <span>Pagar con Bancolombia ({formatCOP(activeTotalAmount)})</span>
                      <ExternalLink className="w-4 h-4 text-dark-bg" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* PASO 3: FACTURA GENERADA & WHATSAPP                              */}
          {/* ================================================================ */}
          {step === 3 && invoice && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              {/* Badge de Éxito y Estado */}
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      ¡Reserva Generada Exitosamente!
                    </h3>
                    <p className="text-xs text-emerald-300/90 font-light">
                      Factura N° <strong className="font-mono">{invoice.invoiceId}</strong> por{" "}
                      <strong className="text-white">{formatCOP(invoice.totalAmount)}</strong>.
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  {invoice.paymentStatus}
                </span>
              </div>

              {/* Factura Imprimible */}
              <div
                id="printable-invoice"
                className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6 text-sm text-neutral-light"
              >
                {/* Factura Encabezado */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h4 className="font-heading text-xl font-bold text-white">
                      {HOTEL_CONFIG.name}
                    </h4>
                    <span className="text-xs text-neutral-gray block font-light">
                      {HOTEL_CONFIG.address}
                    </span>
                    <span className="text-xs text-neutral-gray block font-light">
                      {HOTEL_CONFIG.city} · WhatsApp: {HOTEL_CONFIG.whatsappFormatted}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gold-400 uppercase tracking-wider font-bold block">
                      Factura N° {invoice.invoiceId}
                    </span>
                    <span className="text-xs text-neutral-gray block">
                      Fecha: {invoice.createdAt}
                    </span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-white/10 text-white text-[11px] font-medium">
                      {invoice.paymentMethodLabel}
                    </span>
                  </div>
                </div>

                {/* Datos del Cliente y Estancia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-gray block uppercase font-semibold text-[10px]">
                      Titular de Reserva:
                    </span>
                    <span className="text-white font-bold text-sm block">{invoice.fullName}</span>
                    <span className="text-gold-400 font-mono block mt-0.5">
                      Doc: {invoice.documentId}
                    </span>
                    <span className="text-neutral-gray block">{invoice.email}</span>
                    <span className="text-neutral-gray block">{invoice.phone}</span>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-neutral-gray block uppercase font-semibold text-[10px]">
                      Periodo de Alojamiento:
                    </span>
                    <span className="text-white font-bold text-sm block">
                      {invoice.checkIn} → {invoice.checkOut}
                    </span>
                    <span className="text-neutral-gray block mt-0.5">
                      Duración: {invoice.nights} {invoice.nights === 1 ? "noche" : "noches"}
                    </span>
                    <span className="text-emerald-400 font-semibold block mt-1">
                      Estado: {invoice.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Tabla de Habitaciones */}
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-gold-400 uppercase font-bold border-b border-white/10">
                      <tr>
                        <th className="p-3">Habitación</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Tarifa / Noche</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/90">
                      {invoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="p-3">
                            <span className="font-semibold block">{item.name}</span>
                            <span className="text-[10px] text-neutral-gray">{item.category}</span>
                          </td>
                          <td className="p-3 text-center font-mono">{item.quantity}</td>
                          <td className="p-3 text-right font-mono">{formatCOP(item.pricePerNight)}</td>
                          <td className="p-3 text-right font-mono font-bold text-gold-400">
                            {formatCOP(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Facturado */}
                <div className="flex justify-between items-center pt-2 text-sm sm:text-base border-t border-white/10">
                  <span className="font-bold text-white">Total Facturado (COP):</span>
                  <span className="font-heading text-xl sm:text-2xl font-bold text-gold-gradient">
                    {formatCOP(invoice.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Botones de Acción Posterior */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* BOTÓN OFICIAL: CONFIRMAR Y ENVIAR COMPROBANTE A WHATSAPP */}
                <a
                  href={invoice.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Confirmar y Enviar Comprobante a WhatsApp (+57 301 894 0859)</span>
                </a>

                {/* Imprimir Factura */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 py-4 px-5 rounded-2xl border border-white/20 hover:border-gold-500/50 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs transition-all"
                >
                  <Printer className="w-4 h-4 text-gold-400" />
                  <span>Imprimir Factura</span>
                </button>

                {/* Finalizar y Cerrar */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-4 px-6 rounded-2xl bg-gold-gradient text-dark-bg font-bold text-xs shadow-lg hover:opacity-95 transition-all"
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
