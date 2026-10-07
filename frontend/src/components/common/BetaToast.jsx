import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import FeedbackModal from "./FeedbackModal";
import "./BetaToast.css";

const STORAGE_KEY = "beta_notice_seen";
// Pages with their own full-height layout or a fixed bottom bar the toast
// would collide with.
const HIDDEN_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/onboarding"];

const BetaToast = () => {
  const [visible, setVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { pathname } = useLocation();
  const onHiddenPage = HIDDEN_PATHS.includes(pathname);

  useEffect(() => {
    if (onHiddenPage) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const showId = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, 900);
    return () => clearTimeout(showId);
  }, [onHiddenPage]);

  useEffect(() => {
    if (!visible) return;
    const hideId = setTimeout(() => setVisible(false), 9000);
    return () => clearTimeout(hideId);
  }, [visible]);

  if (!visible && !showForm) return null;

  return (
    <>
      {visible && !onHiddenPage && (
        <div className="beta-toast" role="status">
          <Sparkles size={16} strokeWidth={2.5} className="beta-toast__icon" />
          <span className="beta-toast__message">
            K-pop Universe is in beta — more groups and features are on the way.{" "}
            <button
              className="beta-toast__link"
              onClick={() => setShowForm(true)}
            >
              Share your feedback
            </button>
            !
          </span>
          <button
            className="beta-toast__dismiss"
            onClick={() => setVisible(false)}
            aria-label="dismiss"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
      {showForm && <FeedbackModal onClose={() => setShowForm(false)} />}
    </>
  );
};

export default BetaToast;
