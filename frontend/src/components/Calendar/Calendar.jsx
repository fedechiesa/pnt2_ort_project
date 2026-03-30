
import React, { useMemo } from "react";
import { Calendar as RBCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css"; 

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // lunes
  getDay,
  locales,
});


export default function Calendar({
  mode = "alumno",
  events,
  defaultView = "month",
}) {
  const data = events ?? [];

  return (
    <div style={{ height: "calc(100vh - 150px)", minHeight: 520 }}>
      <RBCalendar
        localizer={localizer}
        events={data}
        startAccessor="start"
        endAccessor="end"
        defaultView={defaultView}
        popup // <- habilita el popup “+N más”
        toolbar // toolbar con Mes/Semana/Día
        messages={{
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          today: "Hoy",
          previous: "Anterior",
          next: "Siguiente",
          showMore: (total) => `+${total} más`,
          noEventsInRange: "Sin eventos en este rango",
        }}
      />
    </div>
  );
}
