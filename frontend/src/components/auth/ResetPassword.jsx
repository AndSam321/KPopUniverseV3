import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/authApi";
import "./Register.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("reset_password_token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Passwords don't match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ token, password, passwordConfirmation });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.errors?.join(", ") ||
          "This reset link is invalid or has expired. Please request a new one."
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
          {done ? (
            <header className="register-header">
              <h2 className="register-title">Password reset</h2>
              <p className="register-subtitle">
                Your password has been updated. Taking you to log in…
              </p>
            </header>
          ) : !token ? (
            <>
              <header className="register-header">
                <h2 className="register-title">Invalid link</h2>
                <p className="register-subtitle">
                  This reset link is missing its token. Request a new one.
                </p>
              </header>
              <p className="register-footer-text">
                <Link to="/forgot-password" className="register-footer-link">
                  Request a new link
                </Link>
              </p>
            </>
          ) : (
            <>
              <header className="register-header">
                <h2 className="register-title">Choose a new password</h2>
                <p className="register-subtitle">Enter and confirm your new password.</p>
              </header>

              {error && <div className="register-error">{error}</div>}

              <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="passwordConfirmation">
                    Confirm new password
                  </label>
                  <input
                    id="passwordConfirmation"
                    type="password"
                    className="form-input"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <button type="submit" className="register-button" disabled={loading}>
                  {loading ? "Resetting..." : "Reset password"}
                </button>
              </form>

              <p className="register-footer-text">
                <Link to="/login" className="register-footer-link">
                  Back to log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
