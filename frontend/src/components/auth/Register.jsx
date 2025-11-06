import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../api/authApi";

export default function Register() {
  const navigate = useNavigate();

  // form fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  // ui state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** @param {React.FormEvent<HTMLFormElement>} e */
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

      // redirect after signup
      navigate("/");
    } catch (/** @type {any} */ err) {
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Create your K-Pop Universe account
        </h1>

        {error && (
          <div className="mb-4 bg-red-500/10 text-red-300 text-sm px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-200 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-200 mb-1">Username</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-200 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-200 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-600 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
