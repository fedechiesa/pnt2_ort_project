import React from "react";
import PlanCalendario from "../HomeAlumno/PlanCalendario";
import "./CalendarPage.css";
import BackButton from "../../components/BackButton.jsx";

export default function CalendarAlumnoPage() {
  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-topbar">
          <BackButton />
        </div>
        <h2 className="calendar-title">📅 Calendario – Alumno</h2>
        <PlanCalendario />
      </div>
    </div>
  );
}
