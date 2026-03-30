import React from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";
import "./HomeEntrenador.css";
import { useAuth } from "../../context/AuthContext";


function HomeEntrenador() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-container">
      <main className="home-main">
        <h2 className="welcome">
          ¡Bienvenido, {user?.nombre || user?.email || "Entrenador"}!
        </h2>
        <p className="subtitle">Seleccioná una opción para comenzar:</p>

        <div className="card-grid">
          <div className="card">
            <h3>Mi perfil</h3>
            <p>Actualizá tu nombre y apellido.</p>
            <button onClick={() => navigate("/entrenador/perfil")}>
              Editar perfil
            </button>
          </div>
          <div className="card">
            <h3>👤 Ver alumnos</h3>
            <p>Consulta la lista de tus alumnos y sus datos de progreso.</p>
            <button onClick={() => navigate("/entrenador/alumnos")}>
            Ver Alumnos</button>
          </div>

          <div className="card">
            <h3>📅 Calendario</h3>
            <p>Ver alumnos que entrenan cada día.</p>
            <button onClick={() => navigate("/calendario/entrenador")}>
              Ver calendario
            </button>
          </div>

          <div className="card">
            <h3>📋 Planes</h3>
            <p>Diseñá un nuevo plan de entrenamiento personalizado.</p>
            <button onClick={() => navigate("/entrenador/plan")}>
            Planes</button>
          </div>

          <div className="card">
            <h3>💪 Rutinas</h3>
            <p>Visualizá y editá las rutinas de entrenamiento disponibles.</p>
            <button onClick={() => navigate("/entrenador/rutinas")}>
            Ver rutinas</button>
          </div>

          <div className="card">
            <h3>🏋️ Ejercicios</h3>
            <p>Ver y gestionar los ejercicios disponibles.</p>
            <button onClick={() => navigate("/entrenador/ejercicios")}>
              Ver ejercicios
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <LogoutButton />
      </footer>
    </div>
  );
}

export default HomeEntrenador;
