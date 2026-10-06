import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../api/authApi";
import "./Register.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-site-title">K-pop Universe</h1>

        <div className="register-card">
          {sent ? (
            <>
              <header className="register-header">
                <h2 className="register-title">Check your email</h2>
                <p className="register-subtitle">
                  If an account exists for <strong>{email}</strong>, we've sent a
                  link to reset your password. It may take a minute to arrive.
                </p>
              </header>
              <p className="register-footer-text">
                <Link to="/login" className="register-footer-link">
                  Back to log in
                </Link>
              </p>
            </>
          ) : (
            <>
              <header className="register-header">
                <h2 className="register-title">Forgot Password</h2>
                <p className="register-subtitle">
                  Enter your email and we'll send you a reset link.
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
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  className="register-button"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="register-footer-text">
                Remembered it?{" "}
                <Link to="/login" className="register-footer-link">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
