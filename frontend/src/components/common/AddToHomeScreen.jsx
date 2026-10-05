import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./AddToHomeScreen.css";

const STORAGE_KEY = "a2hs_dismissed";

const isIosSafariTab = () => {
  const ua = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|android/i.test(ua);
  const isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  return isIos && isSafari && !isStandalone;
};

export default function AddToHomeScreen() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (!isIosSafariTab()) return;
    const id = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(id);
  }, [user]);

  const dismiss = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  return (
    <Link to="/install" className="a2hs" onClick={() => setVisible(false)}>
      <img src="/kpopuniverselogo.svg" alt="" className="a2hs__logo" />
      <div className="a2hs__text">
        <strong className="a2hs__title">Get the full experience</strong>
        <span className="a2hs__sub">Add K-pop Universe to your Home Screen</span>
      </div>
      <ChevronRight size={20} strokeWidth={2.5} className="a2hs__chevron" />
      <button className="a2hs__close" onClick={dismiss} aria-label="dismiss">
        <X size={16} strokeWidth={2.5} />
      </button>
    </Link>
  );
}
