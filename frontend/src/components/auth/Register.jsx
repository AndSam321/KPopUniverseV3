import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import TermsModal from "./TermsModal";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const { login: setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

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

      // Update auth context with user data
      setUser(data.user);

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
        <h1 className="register-site-title">k·pop universe</h1>

        {/* Card with form */}
        <div className="register-card">
          <header className="register-header">
            <h2 className="register-title">create your account</h2>
            <p className="register-subtitle">
              join the largest k-pop community and connect with fans worldwide!{" "}
              <span className="emoji-small">✨</span>
            </p>
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
                placeholder="momofan@twice.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="username">
                username
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="e.g. hyunjin2000"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label className="form-label" htmlFor="password">
                  password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group half">
                <label className="form-label" htmlFor="passwordConfirmation">
                  confirm password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    className="form-input"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPasswordConfirmation(!showPasswordConfirmation)
                    }
                    aria-label={
                      showPasswordConfirmation
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPasswordConfirmation ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="terms-notice">
              by signing up, you agree to our{" "}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="terms-link-button"
              >
                terms and conditions
              </button>
            </p>

            <button
              type="submit"
              className="register-button"
              disabled={loading || !termsAccepted}
            >
              {loading ? "creating account..." : "sign up"}
            </button>
          </form>

          <p className="register-footer-text">
            already have an account?{" "}
            <a href="/login" className="register-footer-link">
              log in
            </a>
          </p>
        </div>
      </div>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setTermsAccepted(true)}
        isAccepted={termsAccepted}
      />
    </div>
  );
}
