import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "./BackButton.css";

export default function BackButton({ fallback = "/", label = "Back" }) {
  const navigate = useNavigate();

  const goBack = () => {
    // React Router tracks position in history as state.idx; >0 means there's an
    // in-app page to go back to, otherwise (deep link) use a sensible fallback.
    const idx = window.history.state?.idx ?? 0;
    if (idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button type="button" className="back-button" onClick={goBack}>
      <ChevronLeft size={18} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}
