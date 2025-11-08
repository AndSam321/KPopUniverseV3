import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./Register.css"; // reuse the same CSS as Register

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

      console.log("Logged in user:", data.user);

      // Update auth context with user data
      setUser(data.user);

      // After login, send them to home (or /feed later)
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
        {/* Same title styling as Register */}
        <h1 className="register-site-title">k·pop universe</h1>

        <div className="register-card">
          <header className="register-header">
            <h2 className="register-title">welcome back</h2>
            <p className="register-subtitle">log in to your account</p>
          </header>

          {error && <div className="register-error">{error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                email
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
                password
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
              {loading ? "logging in..." : "log In"}
            </button>
          </form>

          <p className="register-footer-text">
            don’t have an account yet?{" "}
            <a href="/register" className="register-footer-link">
              sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
