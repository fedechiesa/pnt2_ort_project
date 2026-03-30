import React from "react";
import { useNavigate } from "react-router-dom";
import MiRutina from "./MiRutina";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import "./HomeAlumno.css";

function HomeAlumno() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">
          ¡Bienvenido, {user?.nombre || user?.email || "Alumno"}!
        </h2>
        <p className="subtitle">Estas listo para entrenar?</p>
        <p className="subtitle">Revisa tu entrenamiento y progreso:</p>

        <div className="card-grid">
          <div className="card">
            <h3>Mi perfil</h3>
            <p>Actualiza tu nombre, peso, altura y avatar.</p>
            <button onClick={() => navigate("/alumno/perfil")}>
              Editar perfil
            </button>
          </div>
          <div className="card">
            <h3>Mi rutina</h3>
            <p>Consulta tu plan de entrenamiento actual con detalles diarios.</p>
            <button onClick={() => navigate("/plan/alumno")}>Ver rutina</button>
          </div>

          <div className="card">
            <h3>Calendario</h3>
            <p>Revisa tus dias de entrenamiento y proximos objetivos.</p>
            <button onClick={() => navigate("/calendario/alumno")}>
              Ver calendario
            </button>
          </div>

          <div className="card">
            <h3>Progreso</h3>
            <p>Visualiza tu evolucion y los logros alcanzados.</p>
            <button>Ver progreso</button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <LogoutButton />
      </footer>
    </div>
  );
}

export default HomeAlumno;
