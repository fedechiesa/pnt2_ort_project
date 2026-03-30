import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LogoutButton({
  className = "",
  children = "Cerrar sesión",
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [processing, setProcessing] = useState(false);

  const handleLogout = async () => {
    if (processing) return;

    setProcessing(true);
    try {
      await logout();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("No se pudo cerrar sesión:", error);
      }
    } finally {
      navigate("/", { replace: true });
      setProcessing(false);
    }
  };

  return (
    <button
      type="button"
      className={`logout-btn ${className}`.trim()}
      onClick={handleLogout}
      disabled={processing}
    >
      {processing ? "Cerrando..." : children}
    </button>
  );
}
