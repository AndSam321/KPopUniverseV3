import { useState, useEffect } from "react";
import { Menu, Share, X, ChevronDown, PlusSquare } from "lucide-react";
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

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="a2hs" role="dialog" aria-label="Add to home screen">
      <button className="a2hs__close" onClick={dismiss} aria-label="dismiss">
        <X size={16} strokeWidth={2.5} />
      </button>
      <div className="a2hs__body">
        <img src="/kpopuniverselogo.svg" alt="" className="a2hs__logo" />
        <div className="a2hs__text">
          <strong className="a2hs__title">Install K-pop Universe</strong>
          <span className="a2hs__steps">
            Tap <Menu size={15} className="a2hs__icon" strokeWidth={2.5} /> in the
            toolbar, then <Share size={15} className="a2hs__icon" strokeWidth={2.5} />{" "}
            Share, then{" "}
            <span className="a2hs__chip">
              <PlusSquare size={13} strokeWidth={2.5} /> Add to Home Screen
            </span>
          </span>
        </div>
      </div>
      <div className="a2hs__arrow" aria-hidden="true">
        <ChevronDown size={28} strokeWidth={2.5} />
      </div>
    </div>
  );
}
