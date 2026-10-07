import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { getGroups } from "../api/groupsApi";
import { completeOnboarding } from "../api/onboardingApi";
import { useAuth } from "../context/AuthContext";
import FadeImage from "../components/common/FadeImage";
import "./Onboarding.css";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (groupId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  };

  const finish = async (groupIds) => {
    setSubmitting(true);
    setError("");
    try {
      const data = await completeOnboarding(groupIds);
      updateUser({ ...user, onboarded_at: data.onboarded_at });
      navigate(groupIds.length > 0 ? "/following" : "/");
    } catch (err) {
      console.error("Onboarding failed:", err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="onboarding">
      <header className="onboarding__header">
        <h1 className="onboarding__title">Follow your favorite groups</h1>
        <p className="onboarding__subtitle">
          We'll fill your Following feed with their posts. You can change this
          anytime.
        </p>
      </header>

      {loading ? (
        <div className="onboarding__loading">Loading groups…</div>
      ) : (
        <div className="onboarding__grid">
          {groups.map((group, index) => {
            const isSelected = selected.has(group.id);
            return (
              <button
                key={group.id}
                type="button"
                className={`onboarding__card ${isSelected ? "onboarding__card--selected" : ""}`}
                style={{ "--card-index": index }}
                onClick={() => toggle(group.id)}
                aria-pressed={isSelected}
              >
                <div className="onboarding__logo-wrap">
                  <div className="onboarding__logo">
                    {group.logo_url ? (
                      <FadeImage src={group.logo_url} alt={group.name} />
                    ) : (
                      <span>{group.name.charAt(0)}</span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="onboarding__check">
                      <Check size={16} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <span className="onboarding__name">{group.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <footer className="onboarding__footer">
        {error && <p className="onboarding__error">{error}</p>}
        <button
          type="button"
          className="onboarding__continue"
          disabled={submitting || selected.size === 0}
          onClick={() => finish([...selected])}
        >
          {submitting
            ? "Setting up…"
            : selected.size > 0
              ? `Follow ${selected.size} ${selected.size === 1 ? "group" : "groups"}`
              : "Pick at least one"}
        </button>
        <button
          type="button"
          className="onboarding__skip"
          disabled={submitting}
          onClick={() => finish([])}
        >
          I'll do this later
        </button>
      </footer>
    </div>
  );
};

export default Onboarding;
