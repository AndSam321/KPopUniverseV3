import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import "./BetaToast.css";

const STORAGE_KEY = "beta_notice_seen";

const BetaToast = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const showId = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, 900);
    return () => clearTimeout(showId);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hideId = setTimeout(() => setVisible(false), 9000);
    return () => clearTimeout(hideId);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="beta-toast" role="status">
      <Sparkles size={16} strokeWidth={2.5} className="beta-toast__icon" />
      <span className="beta-toast__message">
        KPop Universe is in beta — more groups and features are on the way. We'd
        love your feedback!
      </span>
      <button
        className="beta-toast__dismiss"
        onClick={() => setVisible(false)}
        aria-label="dismiss"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default BetaToast;
