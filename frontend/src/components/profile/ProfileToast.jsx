import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import "./ProfileToast.css";

function ProfileToast({ message, variant = "error", onDismiss }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 4000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={`profile-toast profile-toast--${variant}`} role="status">
      <Icon size={16} strokeWidth={2.5} className="profile-toast__icon" />
      <span className="profile-toast__message">{message}</span>
      <button
        className="profile-toast__dismiss"
        onClick={onDismiss}
        aria-label="dismiss"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default ProfileToast;
