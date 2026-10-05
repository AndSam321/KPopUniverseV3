import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Sparkles } from "lucide-react";
import FeedbackModal from "../components/common/FeedbackModal";
import "./Help.css";

const INSTALL_STEPS = [
  {
    n: 1,
    title: "Open the Safari menu",
    text: "Tap the ☰ (menu) button in the Safari toolbar at the bottom of your screen.",
    img: "/install/step1-menu.png",
    highlight: { left: "23%", top: "10%", width: "10%", height: "80%", radius: "999px" },
  },
  {
    n: 2,
    title: "Tap Share",
    text: "In the menu that pops up, tap Share.",
    img: "/install/step2-share.png",
    highlight: { left: "2%", top: "14%", width: "72%", height: "40%", radius: "12px" },
  },
  {
    n: 3,
    title: "Add to Home Screen",
    text: "Scroll down in the share sheet and tap Add to Home Screen.",
    img: "/install/step3-add.png",
    highlight: { left: "4%", top: "71%", width: "92%", height: "9%", radius: "14px" },
  },
  {
    n: 4,
    title: "Tap Add",
    text: "Confirm by tapping Add — the K-pop Universe icon will appear on your home screen.",
    img: "/install/step4-confirm.png",
    highlight: { left: "78%", top: "8%", width: "20%", height: "24%", radius: "999px" },
  },
];

const FAQS = [
  {
    q: "How do points and titles work?",
    a: "You earn idol points by posting, commenting, and engaging with the community. As you climb, your title grows from Trainee to Rising Star to Idol to Superstar.",
  },
  {
    q: "How do I join or create a community?",
    a: "Open a group from Explore to see its communities and tap Join. To start your own, tap Create community on a group's page.",
  },
  {
    q: "How do I message someone?",
    a: "Open a profile and tap Message, or use the compose button in your inbox. Group chats are available between friends (people you follow who follow you back).",
  },
];

export default function Help() {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="help">
      <Link to="/" className="help__back">
        <ChevronLeft size={18} strokeWidth={2.5} />
        back
      </Link>

      <header className="help__header">
        <h1 className="page-title">Help &amp; Support</h1>
        <p className="help__subtitle">
          Everything you need to get the most out of K-pop Universe.
        </p>
      </header>

      <section className="help__section" id="install">
        <div className="help__badge">
          <Sparkles size={14} strokeWidth={2.5} />
          best experience
        </div>
        <h2 className="help__section-title">Add to your Home Screen</h2>
        <p className="help__section-intro">
          Install K-pop Universe like an app — full screen, faster, and right on
          your home screen. On iPhone (Safari), it takes just a few taps:
        </p>

        <ol className="install-steps">
          {INSTALL_STEPS.map((step) => (
            <li className="install-step" key={step.n}>
              <div className="install-step__head">
                <span className="install-step__num">{step.n}</span>
                <div>
                  <h3 className="install-step__title">{step.title}</h3>
                  <p className="install-step__text">{step.text}</p>
                </div>
              </div>
              <div className="install-step__shot">
                <img src={step.img} alt={step.title} loading="lazy" />
                <span
                  className="install-step__pointer"
                  style={{
                    left: step.highlight.left,
                    top: step.highlight.top,
                    width: step.highlight.width,
                    height: step.highlight.height,
                    borderRadius: step.highlight.radius,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>

        <p className="help__note">
          Once added, open K-pop Universe from the new icon on your home screen
          for the full-screen app experience. ✨
        </p>
      </section>

      <section className="help__section">
        <h2 className="help__section-title">FAQ</h2>
        <div className="help__faq">
          {FAQS.map((item) => (
            <details className="help__faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="help__section">
        <h2 className="help__section-title">Contact</h2>
        <p className="help__contact">
          K-pop Universe is in beta — more groups and features are on the way.
          Found a bug or have an idea? We'd love your feedback.
        </p>
        <button
          type="button"
          className="help__feedback-btn"
          onClick={() => setShowFeedback(true)}
        >
          Send feedback
        </button>
      </section>

      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
}
