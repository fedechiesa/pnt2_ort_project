import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AUTH_ERRORS } from "../../constants/authErrors";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
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
      const data = await login(email, password);
      const userRole = data.user.rol;

      if (userRole === "entrenador") {
        navigate("/entrenador");
      } else {
        navigate("/alumno");
      }
    } catch (err) {
      setError(err.response?.data?.message || AUTH_ERRORS.LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Fit&Track</h1>
        <h2 className="login-subtitle">Iniciar sesión</h2>

        {error && <p className="login-error">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoCapitalize="off"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoCapitalize="off"
            required
          />

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="login-register">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="login-link">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
