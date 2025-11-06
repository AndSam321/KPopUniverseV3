import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../api/authApi";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const data = await signup({
        email,
        password,
        passwordConfirmation,
        username,
      });

      console.log("Registered user:", data.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.errors?.join(", ") ||
        err?.response?.data?.message ||
        "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Website title OUTSIDE the card */}
        <h1 className="register-site-title">K·POP UNIVERSE</h1>

        {/* Card with form */}
        <div className="register-card">
          <header className="register-header">
            <h2 className="register-title">Create your account</h2>
            <p className="register-subtitle">
              Claim your fandom name and join the galaxy ✨
            </p>
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
                placeholder="you@idolmail.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="e.g. lightstick_lover"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
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
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group half">
                <label className="form-label" htmlFor="passwordConfirmation">
                  Confirm
                </label>
                <input
                  id="passwordConfirmation"
                  type="password"
                  className="form-input"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="register-footer-text">
            Already have an account?{" "}
            <a href="/login" className="register-footer-link">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
