import React, { useEffect, useState } from "react";
import "./PerfilEntrenador.css";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import BackButton from "../../components/BackButton.jsx";

export default function PerfilEntrenador() {
  const { user, updateUser } = useAuth();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    async function cargarDatos() {
      if (user) {
        setNombre(user.nombre || "");
        setApellido(user.apellido || "");
      } else {
        try {
          const data = await authService.getCurrentUser();
          if (data?.user) {
            setNombre(data.user.nombre || "");
            setApellido(data.user.apellido || "");
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    cargarDatos();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await authService.updateProfile({
        nombre,
        apellido,
      });
      await updateUser({ nombre, apellido });
      setMessage("Perfil actualizado correctamente 💪.");
    } catch (err) {
      console.error(err);
      setMessage("No se pudo actualizar el perfil 😢");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="perfil-container">
      <BackButton />
      <main className="perfil-main">
        <h2>Mi perfil de entrenador</h2>

        <form className="perfil-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {message && <p className="perfil-message">{message}</p>}
      </main>
    </div>
  );
}
