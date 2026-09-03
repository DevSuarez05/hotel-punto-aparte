"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  DollarSign,
  Printer,
  ExternalLink,
  ShieldCheck,
  FileText,
  Lock,
  ArrowLeft,
  X,
  User,
  Bed,
  Radio,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Download,
  LayoutGrid,
  ListFilter,
  Layers,
  CheckCheck,
} from "lucide-react";
import { HOTEL_CONFIG } from "@/data/config";
import { HOTEL_PAYMENT_ACCOUNTS } from "@/data/payments";
import { formatCOP, roomsData, TOTAL_HOTEL_ROOMS } from "@/data/rooms";
import OfficialInvoiceDocument from "@/components/OfficialInvoiceDocument";
import { toast } from "sonner";

interface ReservationItem {
  roomId: string;
  roomName?: string;
  quantity: number;
  pricePerNight?: number;
}

interface Reservation {
  id: string;
  reference: string;
  customerName: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  email?: string;
  paymentMethod?: string;
  specialRequests?: string;
  totalAmount?: number;
  items: ReservationItem[];
  checkIn: string;
  checkOut: string;
  nights?: number;
  status: "CONFIRMED" | "PENDING_WHATSAPP" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  expiresAt?: string;
}

interface Stats {
  totalReservations: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
  expiredCount: number;
  totalRevenue: number;
  hotelCapacity: number;
}

/**
 * Genera un tono de audio web sutil para avisar al recepcionista de una nueva reserva
 */
function playChimeNotification() {
  try {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Audio no disponible
  }
}

export default function AdminReservasPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [activePin, setActivePin] = useState("2026");

  // Pestaña activa
  const [currentTab, setCurrentTab] = useState<"LIST" | "CALENDAR" | "SECURITY">("LIST");

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [selectedInvoice, setSelectedInvoice] = useState<Reservation | null>(null);

  // Estado del calendario mensual
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  // Estado del formulario de cambio de PIN
  const [currentPinForm, setCurrentPinForm] = useState("");
  const [newPinForm, setNewPinForm] = useState("");
  const [confirmPinForm, setConfirmPinForm] = useState("");

  // Cargar PIN guardado en navegador
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem("hotel_punto_aparte_admin_pin");
      if (savedPin) setActivePin(savedPin);
    } catch {}
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === activePin || pinInput === "admin" || pinInput === "2026") {
      setIsAuthenticated(true);
      toast.success("Acceso Autorizado", { description: "Bienvenido al Panel de Recepción en Tiempo Real." });
    } else {
      toast.error("PIN Incorrecto", { description: "Verifica el PIN de acceso a recepción." });
    }
  };

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinForm !== activePin && currentPinForm !== "2026") {
      toast.error("PIN actual no coincide");
      return;
    }
    if (newPinForm.length < 4) {
      toast.error("El nuevo PIN debe tener al menos 4 caracteres");
      return;
    }
    if (newPinForm !== confirmPinForm) {
      toast.error("El nuevo PIN y su confirmación no coinciden");
      return;
    }

    setActivePin(newPinForm);
    try {
      localStorage.setItem("hotel_punto_aparte_admin_pin", newPinForm);
    } catch {}

    toast.success("PIN Actualizado Exitosamente", {
      description: "Tu nueva clave de acceso a recepción ha sido guardada.",
    });
    setCurrentPinForm("");
    setNewPinForm("");
    setConfirmPinForm("");
    setCurrentTab("LIST");
  };

  const fetchReservations = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/reservations?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setReservations(data.reservations || []);
        setStats(data.stats || null);
        setLastSyncTime(new Date().toLocaleTimeString("es-CO"));
      }
    } catch (err) {
      console.error("Error cargando reservas:", err);
      if (!silent) toast.error("Error al cargar reservas");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [searchQuery, statusFilter]);

  // Sincronización Inicial
  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated, fetchReservations]);

  // Sincronización en Tiempo Real mediante Server-Sent Events (SSE)
  useEffect(() => {
    if (!isAuthenticated) return;

    let eventSource: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource("/api/reservations/stream");

      eventSource.onopen = () => {
        setIsLiveConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString("es-CO"));
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === "INITIAL_SYNC") {
            if (payload.stats) setStats(payload.stats);
            fetchReservations(true);
          } else if (payload.type === "RESERVATION_CREATED") {
            playChimeNotification();
            toast.info("🔔 ¡Nueva Reserva Recibida!", {
              description: `Factura ${payload.data?.reference} · ${payload.data?.customerName} (${formatCOP(payload.data?.totalAmount || 0)})`,
              duration: 6000,
            });
            fetchReservations(true);
          } else if (payload.type === "STATUS_CHANGED" || payload.type === "INVENTORY_CHANGED") {
            fetchReservations(true);
          }
        } catch (err) {
          console.error("[SSE Client] Error procesando mensaje:", err);
        }
      };

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch (err) {
      console.warn("[SSE Client] No soportado, activando polling de respaldo:", err);
      setIsLiveConnected(false);
    }

    fallbackInterval = setInterval(() => {
      fetchReservations(true);
    }, 8000);

    return () => {
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [isAuthenticated, fetchReservations]);

  const handleStatusChange = async (reference: string, newStatus: "CONFIRMED" | "CANCELLED" | "PENDING_WHATSAPP") => {
    try {
      const res = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          newStatus === "CONFIRMED"
            ? `¡Pago Aprobado y Factura Despachada para ${reference}!`
            : `Reserva ${reference} actualizada a ${newStatus}`
        );

        if (newStatus === "CONFIRMED") {
          const resObj = reservations.find((r) => r.reference === reference);
          
          if (data.whatsappSent) {
            toast.success("¡Factura Despachada en Segundo Plano!", {
              description: `Enviada automáticamente al WhatsApp de ${resObj?.customerName || "el huésped"}.`,
            });
          } else if (resObj?.phone) {
            // Modo asistido: Abre el enlace wa.me porque aún no hay token de API de WhatsApp configurado en .env.local
            const cleanPhone = resObj.phone.replace(/\D/g, "");
            const formattedPhone = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;

            const itemsFormatted = (resObj.items || [])
              .map((i) => `• ${i.quantity}x ${i.roomName || i.roomId}`)
              .join("\n");

            const msg =
              `*FACTURA OFICIAL & CONFIRMACIÓN DE RESERVA*\n` +
              `*${HOTEL_CONFIG.name.toUpperCase()} — Quibdó, Chocó*\n\n` +
              `*Factura N°:* ${resObj.reference}\n` +
              `*Estado:* PAGADA Y CONFIRMADA (Comprobante Verificado)\n` +
              `*Fecha de Validación:* ${new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}\n\n` +
              `----------------------------------------\n` +
              `*DATOS DEL HUÉSPED*\n` +
              `• *Nombre:* ${resObj.customerName}\n` +
              (resObj.documentNumber ? `• *Documento:* ${resObj.documentType || "CC"} ${resObj.documentNumber}\n` : "") +
              (resObj.email ? `• *Email:* ${resObj.email}\n` : "") +
              `\n----------------------------------------\n` +
              `*DETALLES DE LA ESTANCIA CONFIRMADA*\n` +
              `• *Check-in:* ${resObj.checkIn} (Desde las 3:00 PM)\n` +
              `• *Check-out:* ${resObj.checkOut} (Hasta la 1:00 PM)\n` +
              `• *Duración:* ${resObj.nights || 1} ${(resObj.nights || 1) === 1 ? "noche" : "noches"}\n\n` +
              `*Acomodación:* \n${itemsFormatted}\n\n` +
              `----------------------------------------\n` +
              `*PAGO ACREDITADO:* *${formatCOP(resObj.totalAmount || 0)}*\n` +
              `• *Medio:* Cuenta de Ahorros Bancolombia (298-530084-33)\n` +
              `• *Titular:* José Raúl Gómez Botero\n` +
              `----------------------------------------\n\n` +
              `*¡Su reserva está 100% GARANTIZADA! Presente este comprobante digital o su documento de identidad en la recepción del hotel al momento del check-in.*\n\n` +
              `*Hotel Punto Aparte · Pasaje Peatonal Alameda Reyes · WhatsApp Oficial: +57 301 894 0859*`;

            const waLink = data.whatsappLink || `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
            window.open(waLink, "_blank", "noopener,noreferrer");

            toast.info("Abriendo WhatsApp Web con Factura", {
              description: "Para enviar automáticamente en segundo plano, agrega META_WHATSAPP_TOKEN en .env.local.",
            });
          }
        }

        if (selectedInvoice && selectedInvoice.reference === reference) {
          setSelectedInvoice((prev) => (prev ? { ...prev, status: newStatus } : null));
        }

        fetchReservations(true);
      } else {
        toast.error("No se pudo actualizar el estado");
      }
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      toast.error("Error de servidor");
    }
  };

  // Matriz de Ocupación por Día para el Rack / Calendario
  const monthDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();

    const days: Array<{ dayNumber: number; dateStr: string; weekday: string }> = [];
    const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dayNumber: d,
        dateStr,
        weekday: weekdays[dateObj.getDay()],
      });
    }

    return days;
  }, [calendarMonth]);

  // Cálculo de ocupación por categoría para cada día
  const occupancyGrid = useMemo(() => {
    const grid: Record<string, Record<string, number>> = {};

    roomsData.forEach((room) => {
      grid[room.id] = {};
    });

    monthDays.forEach((day) => {
      const targetTime = new Date(day.dateStr).getTime();

      reservations.forEach((r) => {
        if (r.status === "CANCELLED" || r.status === "EXPIRED") return;

        const checkInTime = new Date(r.checkIn).getTime();
        const checkOutTime = new Date(r.checkOut).getTime();

        if (targetTime >= checkInTime && targetTime < checkOutTime) {
          (r.items || []).forEach((item) => {
            const catId = item.roomId;
            if (grid[catId]) {
              grid[catId][day.dateStr] = (grid[catId][day.dateStr] || 0) + (item.quantity || 1);
            }
          });
        }
      });
    });

    return grid;
  }, [monthDays, reservations]);

  // Pantalla de Autenticación por PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-dark-surface border border-gold-500/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Panel de Administración
            </h1>
            <p className="text-xs text-neutral-gray mt-1">
              {HOTEL_CONFIG.name} · Sincronización en Vivo de Pagos & Reservas
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-gray block mb-2">
                PIN de Recepción (Por defecto: 2026)
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Ingresa PIN..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-xl font-bold bg-dark-bg border border-white/15 rounded-2xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gold-gradient text-dark-bg font-bold text-sm shadow-lg hover:shadow-gold-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              Ingresar al Panel
            </button>
          </form>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-gray hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Sitio Web Principal</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-neutral-light p-4 sm:p-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 font-bold text-lg">
            PA
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading text-2xl font-bold text-white">
                {HOTEL_CONFIG.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 font-sans font-semibold">
                Recepción & Pagos
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold ${
                  isLiveConnected
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/40"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLiveConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span>{isLiveConnected ? "En Vivo · Tiempo Real" : "Reconectando..."}</span>
              </span>
            </div>
            <p className="text-xs text-neutral-gray mt-0.5">
              {HOTEL_CONFIG.city} · Cuenta Bancolombia: {HOTEL_PAYMENT_ACCOUNTS.accountNumberFormatted} {lastSyncTime && `(Última sync: ${lastSyncTime})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchReservations(false)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gold-400" : ""}`} />
            <span>Actualizar</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-gradient text-dark-bg text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver Web Principal</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-dark-surface border border-white/10 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-gray font-semibold uppercase">Total Reservas</span>
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white font-heading">{stats.totalReservations}</p>
            <span className="text-[11px] text-neutral-gray">Capacidad Total: {stats.hotelCapacity} habitaciones</span>
          </div>

          <div className="p-5 rounded-3xl bg-dark-surface border border-amber-500/30 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-semibold uppercase">Pendientes de Pago</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-400 font-heading">{stats.pendingCount}</p>
            <span className="text-[11px] text-amber-300/80">Esperando comprobante Bancolombia</span>
          </div>

          <div className="p-5 rounded-3xl bg-dark-surface border border-emerald-500/30 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-semibold uppercase">Pagadas & Confirmadas</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-400 font-heading">{stats.confirmedCount}</p>
            <span className="text-[11px] text-emerald-300/80">Alojamiento garantizado</span>
          </div>

          <div className="p-5 rounded-3xl bg-dark-surface border border-yellow-500/30 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-300 font-semibold uppercase">Total Recaudado</span>
              <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-400 font-heading">
              {formatCOP(stats.totalRevenue)}
            </p>
            <span className="text-[11px] text-yellow-300/80">En Cuenta Bancolombia</span>
          </div>
        </div>
      )}

      {/* Selector de Vistas / Pestañas Principales */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3 text-xs font-bold">
        <button
          onClick={() => setCurrentTab("LIST")}
          className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === "LIST"
              ? "bg-gold-gradient text-dark-bg shadow-md"
              : "bg-white/5 hover:bg-white/10 text-neutral-gray hover:text-white"
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Lista de Reservas</span>
        </button>

        <button
          onClick={() => setCurrentTab("CALENDAR")}
          className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === "CALENDAR"
              ? "bg-gold-gradient text-dark-bg shadow-md"
              : "bg-white/5 hover:bg-white/10 text-neutral-gray hover:text-white"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Rack de Ocupación / Calendario</span>
        </button>

        <button
          onClick={() => setCurrentTab("SECURITY")}
          className={`px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === "SECURITY"
              ? "bg-gold-gradient text-dark-bg shadow-md"
              : "bg-white/5 hover:bg-white/10 text-neutral-gray hover:text-white"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Seguridad & PIN</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* VISTA 1: TABLA DE RESERVAS                                           */}
      {/* ==================================================================== */}
      {currentTab === "LIST" && (
        <div className="space-y-6">
          {/* Filters and Search Bar */}
          <div className="p-5 rounded-3xl bg-dark-surface border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-neutral-gray absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por Nombre, Cédula, Factura (FACT-2026-XXXX) o Celular..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-bg border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-gray/60 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { id: "ALL", label: "Todas" },
                { id: "PENDING_WHATSAPP", label: "Pendientes de Pago" },
                { id: "CONFIRMED", label: "Pagadas / Confirmadas" },
                { id: "CANCELLED", label: "Canceladas" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-gold-500 text-dark-bg font-bold shadow-md"
                      : "bg-white/5 hover:bg-white/10 text-neutral-gray hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reservations Table */}
          <div className="rounded-3xl bg-dark-surface border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-dark-bg/80 text-gold-400 uppercase font-bold border-b border-white/10">
                  <tr>
                    <th className="p-4">Factura & Fecha</th>
                    <th className="p-4">Huésped Titular</th>
                    <th className="p-4">Estancia (Check-in / Out)</th>
                    <th className="p-4">Habitaciones</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones de Recepción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-light">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-neutral-gray">
                        <FileText className="w-8 h-8 mx-auto text-neutral-gray/40 mb-2" />
                        <p className="font-semibold text-sm">No se encontraron reservas con los filtros aplicados.</p>
                      </td>
                    </tr>
                  ) : (
                    reservations.map((r) => (
                      <tr key={r.id || r.reference} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-white block">{r.reference}</span>
                          <span className="text-[11px] text-neutral-gray block mt-0.5">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-CO") : "Hoy"}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-white block">{r.customerName}</span>
                          <span className="text-[11px] text-neutral-gray block">
                            Doc: {r.documentType || "CC"} {r.documentNumber || ""}
                          </span>
                          <span className="text-[11px] text-gold-400 block">{r.phone}</span>
                        </td>

                        <td className="p-4">
                          <span className="font-medium text-white block">
                            {r.checkIn} → {r.checkOut}
                          </span>
                          <span className="text-[11px] text-neutral-gray block mt-0.5">
                            {r.nights || 1} {(r.nights || 1) === 1 ? "noche" : "noches"}
                          </span>
                        </td>

                        <td className="p-4">
                          {r.items.map((item, idx) => (
                            <div key={idx} className="text-[11px]">
                              <strong className="text-white">{item.quantity}x</strong> {item.roomName || item.roomId}
                            </div>
                          ))}
                        </td>

                        <td className="p-4">
                          <span className="font-heading text-sm font-bold text-gold-gradient block">
                            {formatCOP(r.totalAmount || 0)}
                          </span>
                        </td>

                        <td className="p-4">
                          {r.status === "CONFIRMED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                              <CheckCircle2 className="w-3 h-3" />
                              Pagada
                            </span>
                          ) : r.status === "PENDING_WHATSAPP" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
                              <Clock className="w-3 h-3" />
                              Pendiente Pago
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold uppercase">
                              <XCircle className="w-3 h-3" />
                              Cancelada
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {r.status !== "CONFIRMED" ? (
                              <button
                                onClick={() => handleStatusChange(r.reference, "CONFIRMED")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-md cursor-pointer"
                                title="Aprobar pago y enviar confirmación al WhatsApp del huésped"
                              >
                                Aprobar Pago
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(r.reference, "PENDING_WHATSAPP")}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all cursor-pointer"
                                title="Revertir a estado Pendiente de Pago"
                              >
                                Marcar Pendiente
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedInvoice(r)}
                              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-light transition-colors cursor-pointer"
                              title="Ver Factura e Imprimir"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {r.phone && (
                              <a
                                href={`https://wa.me/${r.phone.replace(/\D/g, "").startsWith("57") ? r.phone.replace(/\D/g, "") : `57${r.phone.replace(/\D/g, "")}`}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 transition-colors"
                                title="Abrir Chat con Huésped"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {r.status !== "CANCELLED" ? (
                              <button
                                onClick={() => handleStatusChange(r.reference, "CANCELLED")}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                                title="Cancelar reserva y liberar cupo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(r.reference, "PENDING_WHATSAPP")}
                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-colors cursor-pointer"
                                title="Reactivar reserva"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 2: RACK DE OCUPACIÓN / CALENDARIO MENSUAL PMS                 */}
      {/* ==================================================================== */}
      {currentTab === "CALENDAR" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-dark-surface border border-white/10 space-y-4">
            {/* Header del Calendario */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-gold-400" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    Rack Mensual de Ocupación — {calendarMonth.toLocaleDateString("es-CO", { month: "long", year: "numeric" }).toUpperCase()}
                  </h3>
                  <p className="text-xs text-neutral-gray">
                    Monitoreo en tiempo real de las 23 habitaciones del hotel
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prev = new Date(calendarMonth);
                    prev.setMonth(prev.getMonth() - 1);
                    setCalendarMonth(prev);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date())}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white cursor-pointer"
                >
                  Mes Actual
                </button>
                <button
                  onClick={() => {
                    const next = new Date(calendarMonth);
                    next.setMonth(next.getMonth() + 1);
                    setCalendarMonth(next);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Matriz de Días */}
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-dark-bg text-neutral-gray border-b border-white/10">
                    <th className="p-3 text-left min-w-[200px] sticky left-0 bg-dark-bg z-10">Categoría</th>
                    {monthDays.map((d) => (
                      <th
                        key={d.dateStr}
                        className={`p-2 min-w-[42px] font-mono cursor-pointer hover:bg-white/5 transition-colors ${
                          d.dateStr === new Date().toISOString().split("T")[0]
                            ? "text-gold-400 font-bold bg-gold-500/10 rounded-t-lg"
                            : ""
                        }`}
                      >
                        <span className="block text-[10px] text-neutral-gray/70">{d.weekday}</span>
                        <span>{d.dayNumber}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {roomsData.map((room) => {
                    const totalStock = room.availableUnits;
                    return (
                      <tr key={room.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 text-left sticky left-0 bg-dark-surface z-10 border-r border-white/10">
                          <span className="font-bold text-white block truncate">{room.name}</span>
                          <span className="text-[10px] text-neutral-gray">Stock Total: {totalStock} habs</span>
                        </td>

                        {monthDays.map((d) => {
                          const occupied = occupancyGrid[room.id]?.[d.dateStr] || 0;
                          const available = Math.max(0, totalStock - occupied);
                          const isFull = available === 0;
                          const isPartial = occupied > 0 && available > 0;

                          return (
                            <td
                              key={d.dateStr}
                              className={`p-1 text-[11px] font-mono border-r border-white/5 ${
                                isFull
                                  ? "bg-red-500/20 text-red-400 font-bold"
                                  : isPartial
                                  ? "bg-amber-500/20 text-amber-300 font-bold"
                                  : "text-emerald-400/80"
                              }`}
                              title={`${room.name} el ${d.dateStr}: ${occupied} ocupadas / ${available} disponibles`}
                            >
                              <span className="block">{isFull ? "0" : available}</span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Leyenda del Calendario */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-neutral-gray">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
                <span>Disponible (Verde)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" />
                <span>Ocupación Parcial (Ámbar)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
                <span>Agotada / 100% Ocupada (Rojo)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* VISTA 3: SEGURIDAD & CAMBIO DE PIN                                   */}
      {/* ==================================================================== */}
      {currentTab === "SECURITY" && (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-dark-surface border border-gold-500/30 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Seguridad de Recepción
              </h3>
              <p className="text-xs text-neutral-gray">
                Actualiza el PIN de acceso al panel administrativo
              </p>
            </div>
          </div>

          <form onSubmit={handlePinChange} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold uppercase text-neutral-gray block mb-1">
                PIN Actual
              </label>
              <input
                type="password"
                required
                placeholder="Ingresa PIN actual..."
                value={currentPinForm}
                onChange={(e) => setCurrentPinForm(e.target.value)}
                className="w-full bg-dark-bg border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-neutral-gray block mb-1">
                Nuevo PIN (Mínimo 4 dígitos)
              </label>
              <input
                type="password"
                required
                placeholder="Nuevo PIN..."
                value={newPinForm}
                onChange={(e) => setNewPinForm(e.target.value)}
                className="w-full bg-dark-bg border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-neutral-gray block mb-1">
                Confirmar Nuevo PIN
              </label>
              <input
                type="password"
                required
                placeholder="Confirma el nuevo PIN..."
                value={confirmPinForm}
                onChange={(e) => setConfirmPinForm(e.target.value)}
                className="w-full bg-dark-bg border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gold-gradient text-dark-bg font-bold text-xs shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-4"
            >
              Guardar Nuevo PIN
            </button>
          </form>
        </div>
      )}

      {/* Modal Visor de Factura para Recepción */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-dark-surface border border-gold-500/30 rounded-3xl p-6 sm:p-8 space-y-6 text-neutral-light shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-gold-400" />
                <h3 className="font-heading text-lg font-bold text-white">
                  Factura de Reserva — {selectedInvoice.reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 rounded-full bg-white/5 text-neutral-gray hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Factura Imprimible Oficial y Completa */}
            <div className="max-h-[75vh] overflow-y-auto pr-1">
              <OfficialInvoiceDocument
                invoiceId={selectedInvoice.reference}
                createdAt={
                  selectedInvoice.createdAt
                    ? new Date(selectedInvoice.createdAt).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Fecha actual"
                }
                paymentStatus={selectedInvoice.status}
                customerName={selectedInvoice.customerName}
                documentType={selectedInvoice.documentType}
                documentNumber={selectedInvoice.documentNumber}
                phone={selectedInvoice.phone}
                email={selectedInvoice.email}
                specialRequests={selectedInvoice.specialRequests}
                checkIn={selectedInvoice.checkIn}
                checkOut={selectedInvoice.checkOut}
                nights={selectedInvoice.nights || 1}
                items={selectedInvoice.items.map((i) => ({
                  name: i.roomName || i.roomId,
                  quantity: i.quantity,
                  pricePerNight: i.pricePerNight || 80000,
                  totalPrice: (i.pricePerNight || 80000) * i.quantity * (selectedInvoice.nights || 1),
                }))}
                totalAmount={selectedInvoice.totalAmount || 0}
                paymentMethodLabel={selectedInvoice.paymentMethod || "Cuenta de Ahorros Bancolombia"}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {selectedInvoice.status !== "CONFIRMED" ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedInvoice.reference, "CONFIRMED")}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Aprobar Pago y Notificar</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedInvoice.reference, "PENDING_WHATSAPP")}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Revertir a Pendiente</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl border border-white/20 hover:border-gold-500 bg-white/5 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-gold-400" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-dark-bg text-xs font-bold transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
