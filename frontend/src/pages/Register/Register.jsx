import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AUTH_ERRORS } from "../../constants/authErrors";
import "./Register.css";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!nombre.trim()) {
      setError(AUTH_ERRORS.REQUIRED_FIELD);
      return false;
    }
    if (nombre.trim().length < 2) {
      setError(AUTH_ERRORS.NAME_TOO_SHORT);
      return false;
    }
    if (!email.trim()) {
      setError(AUTH_ERRORS.REQUIRED_FIELD);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(AUTH_ERRORS.INVALID_EMAIL);
      return false;
    }
    if (!password) {
      setError(AUTH_ERRORS.REQUIRED_FIELD);
      return false;
    }
    if (password.length < 6) {
      setError(AUTH_ERRORS.PASSWORD_TOO_SHORT);
      return false;
    }
    if (!rol) {
      setError(AUTH_ERRORS.ROLE_REQUIRED);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await register({ nombre, email, password, rol });
      const userRole = data.user.rol;

      if (userRole === "entrenador") {
        navigate("/entrenador");
      } else {
        navigate("/alumno");
      }
    } catch (err) {
      setError(err.response?.data?.message || AUTH_ERRORS.REGISTRATION_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1 className="signup-title">Fit&Track</h1>
        <h2 className="signup-subtitle">Crear cuenta</h2>

        {error && <p className="signup-error">{error}</p>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre completo"
            className="signup-input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
            autoCapitalize="words"
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="signup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoCapitalize="off"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="signup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoCapitalize="off"
            required
          />

          <div className="signup-role">
            <label>
              <input
                type="radio"
                name="rol"
                value="entrenador"
                checked={rol === "entrenador"}
                onChange={(e) => setRol(e.target.value)}
                required
              />{" "}
              Entrenador
            </label>
            <label>
              <input
                type="radio"
                name="rol"
                value="alumno"
                checked={rol === "alumno"}
                onChange={(e) => setRol(e.target.value)}
                required
              />{" "}
              Alumno
            </label>
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="signup-login">
          ¿Ya tenés cuenta?{" "}
          <Link to="/" className="register-link">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
