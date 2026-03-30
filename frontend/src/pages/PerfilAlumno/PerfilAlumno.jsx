import React, { useEffect, useState } from "react";
import "./PerfilAlumno.css";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import BackButton from "../../components/BackButton.jsx";

export default function PerfilAlumno() {
  const { user, updateUser } = useAuth();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      if (user) {
        setNombre(user.nombre || "");
        setApellido(user.apellido || "");
        setPeso(user.peso ?? "");
        setAltura(user.altura ?? "");
        setAvatarUrl(user.avatarUrl || "");
      } else {
        try {
          const data = await authService.getCurrentUser();
          if (data?.user) {
            const u = data.user;
            setNombre(u.nombre || "");
            setApellido(u.apellido || "");
            setPeso(u.peso ?? "");
            setAltura(u.altura ?? "");
            setAvatarUrl(u.avatarUrl || "");
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
        peso: peso !== "" ? Number(peso) : null,
        altura: altura !== "" ? Number(altura) : null,
        avatarUrl: avatarUrl || null,
      });
      await updateUser({
        nombre,
        apellido,
        peso: peso !== "" ? Number(peso) : null,
        altura: altura !== "" ? Number(altura) : null,
        avatarUrl: avatarUrl || null,
      });
      setMessage("Perfil actualizado correctamente ✅");
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
        <h2>Mi perfil de alumno</h2>

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

          <label>
            Peso (kg)
            <input
              type="number"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </label>

          <label>
            Altura (cm)
            <input
              type="number"
              step="0.1"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
            />
          </label>

          <label>
            URL de avatar
            <input
              type="url"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </label>

          {avatarUrl && (
            <div className="avatar-preview">
              <p>Vista previa:</p>
              <img src={avatarUrl} alt="Avatar" />
            </div>
          )}

          <button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {message && <p className="perfil-message">{message}</p>}
      </main>
    </div>
  );
}
