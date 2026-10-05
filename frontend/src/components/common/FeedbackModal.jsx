import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { submitFeedback } from "../../api/feedbackApi";
import "./FeedbackModal.css";

export default function FeedbackModal({ onClose }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await submitFeedback(message.trim());
      setSent(true);
    } catch {
      setError("Couldn't send your feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-modal__overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <button className="feedback-modal__close" onClick={onClose} aria-label="close">
          <X size={18} strokeWidth={2.5} />
        </button>

        {sent ? (
          <div className="feedback-modal__done">
            <div className="feedback-modal__check">
              <Check size={22} strokeWidth={3} />
            </div>
            <h2 className="feedback-modal__title">Thanks for the feedback!</h2>
            <p className="feedback-modal__sub">
              It helps shape what gets built next.
            </p>
            <button className="feedback-modal__submit" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="feedback-modal__form" onSubmit={handleSubmit}>
            <h2 className="feedback-modal__title">Send feedback</h2>
            <p className="feedback-modal__sub">
              Found a bug or have an idea? Tell us what's on your mind.
            </p>
            <textarea
              className="feedback-modal__textarea"
              placeholder="Your feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={5}
              autoFocus
            />
            {error && <p className="feedback-modal__error">{error}</p>}
            <button
              type="submit"
              className="feedback-modal__submit"
              disabled={!message.trim() || submitting}
            >
              {submitting ? "Sending..." : "Send feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
