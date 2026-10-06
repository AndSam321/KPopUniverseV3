import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import "./LoginGate.css";

export default function LoginGate({ message = "Log in to view this content." }) {
  return (
    <div className="login-gate">
      <div className="login-gate__card">
        <div className="login-gate__icon">
          <Lock size={22} strokeWidth={2.5} />
        </div>
        <h2 className="login-gate__title">Members only</h2>
        <p className="login-gate__text">{message}</p>
        <div className="login-gate__actions">
          <Link to="/register" className="login-gate__cta login-gate__cta--primary">
            Join the community
          </Link>
          <Link to="/login" className="login-gate__cta">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
