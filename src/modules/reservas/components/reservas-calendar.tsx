"use client";

import "@/shared/styles/fullcalendar-base.css";
import "@/shared/styles/fullcalendar-tabi.css";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { Reserva } from "@/modules/reservas/types/reserva";
import type { Cliente } from "@/modules/clientes/types/cliente";
import { getClienteNombre } from "@/modules/clientes/services/cliente.service";
import { getEstadoConfig } from "@/modules/reservas/lib/reserva-estado-ui";
import { cn } from "@/shared/lib/utils";

interface ReservasCalendarProps {
  reservas: Reserva[];
  clientes: Record<string, Cliente>;
  onSelect: (reserva: Reserva) => void;
  onDateClick?: (date: string) => void;
  className?: string;
}

const ESTADO_COLORS: Record<string, string> = {
  success: "#16a34a",
  destructive: "#dc2626",
  warning: "#d97706",
  default: "#f55e57",
};

export function ReservasCalendar({
  reservas,
  clientes,
  onSelect,
  onDateClick,
  className,
}: ReservasCalendarProps) {
  const events = reservas.map((r) => {
    const config = getEstadoConfig(r.Estado);
    const color =
      config.variant === "success"
        ? ESTADO_COLORS.success
        : config.variant === "destructive"
          ? ESTADO_COLORS.destructive
          : config.variant === "warning"
            ? ESTADO_COLORS.warning
            : ESTADO_COLORS.default;

    return {
      id: r.ID_Key,
      title: `${getClienteNombre(clientes[r.ID_Cliente])} · ${r.Cantidad_personas} pax`,
      start: `${r.Fecha}T${r.Hora?.slice(0, 8) ?? "12:00:00"}`,
      backgroundColor: color,
      borderColor: color,
      textColor: "#ffffff",
      extendedProps: { reserva: r },
    };
  });

  return (
    <div
      className={cn(
        "tabi-calendar overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estados</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Pendiente", color: ESTADO_COLORS.warning },
            { label: "Confirmada", color: ESTADO_COLORS.success },
            { label: "Cancelada", color: ESTADO_COLORS.destructive },
            { label: "Otras", color: ESTADO_COLORS.default },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
          }}
          titleFormat={{
            year: "numeric",
            month: "long",
          }}
          dayHeaderFormat={{
            weekday: "short",
            day: "numeric",
            month: "numeric",
            omitCommas: true,
          }}
          locale={esLocale}
          slotMinTime="08:00:00"
          slotMaxTime="24:00:00"
          slotDuration="00:30:00"
          allDaySlot={false}
          nowIndicator
          height={640}
          expandRows
          stickyHeaderDates
          dayMaxEvents={3}
          events={events}
          eventClick={(info) => {
            const reserva = info.event.extendedProps.reserva as Reserva;
            onSelect(reserva);
          }}
          dateClick={(info) => onDateClick?.(info.dateStr.slice(0, 10))}
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            omitZeroMinute: false,
            meridiem: "short",
          }}
        />
      </div>
    </div>
  );
}
