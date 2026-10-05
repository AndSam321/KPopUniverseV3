import { Link } from "react-router-dom";
import { ChevronLeft, Sparkles } from "lucide-react";
import "./Install.css";

const STEPS = [
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
    text: "Scroll down in the share sheet and tap Add to Home Screen, then tap Add in the top corner.",
    img: "/install/step3-add.png",
    highlight: { left: "4%", top: "71%", width: "92%", height: "9%", radius: "14px" },
  },
];

export default function Install() {
  return (
    <div className="install">
      <Link to="/" className="install__back">
        <ChevronLeft size={18} strokeWidth={2.5} />
        back
      </Link>

      <header className="install__header">
        <div className="install__badge">
          <Sparkles size={14} strokeWidth={2.5} />
          best experience
        </div>
        <h1 className="page-title">Add to your Home Screen</h1>
        <p className="install__subtitle">
          Install K-pop Universe like an app — full screen, faster, and right on
          your home screen. On iPhone (Safari), it takes three taps:
        </p>
      </header>

      <ol className="install__steps">
        {STEPS.map((step) => (
          <li className="install-step" key={step.n}>
            <div className="install-step__head">
              <span className="install-step__num">{step.n}</span>
              <div>
                <h2 className="install-step__title">{step.title}</h2>
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

      <p className="install__footer">
        Once added, open K-pop Universe from the new icon on your home screen for
        the full-screen app experience. ✨
      </p>
    </div>
  );
}
