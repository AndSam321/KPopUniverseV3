import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

export default function Login() {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const data = await login({
        email,
        password,
      });

      setUser(data.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.errors?.join(", ") ||
        err?.response?.data?.message ||
        "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-site-title">K-pop Universe</h1>

        <div className="register-card">
          <header className="register-header">
            <h2 className="register-title">Welcome Back</h2>
            <p className="register-subtitle">Log in to your account</p>
          </header>

          {error && <div className="register-error">{error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="jungkook@bts.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="register-footer-text">
            Don’t have an account yet?{" "}
            <a href="/register" className="register-footer-link">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
