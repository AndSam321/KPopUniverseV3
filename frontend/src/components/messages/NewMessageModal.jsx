import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search } from "lucide-react";
import { search } from "../../api/searchApi";
import { createConversation } from "../../api/messagesApi";
import { useAuth } from "../../context/AuthContext";
import "./NewMessageModal.css";

export default function NewMessageModal({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      setLoading(true);
      search(term, { type: "users" })
        .then((res) => setResults(res.data.filter((u) => u.id !== user?.id)))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, user?.id]);

  const startConversation = async (recipient) => {
    if (starting) return;
    setStarting(true);
    try {
      const conversation = await createConversation(recipient.id);
      onClose();
      navigate(`/messages/${conversation.id}`);
    } catch {
      setStarting(false);
    }
  };

  return (
    <div className="nm-overlay" onClick={onClose}>
      <div className="nm-modal" onClick={(event) => event.stopPropagation()}>
        <div className="nm-header">
          <h2 className="nm-title">New message</h2>
          <button className="nm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="app-search nm-search">
          <Search size={18} className="app-search__icon" />
          <input
            className="app-search__input"
            placeholder="Search people…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </div>

        <div className="nm-results">
          {loading ? (
            <p className="nm-hint">Searching…</p>
          ) : results.length === 0 ? (
            <p className="nm-hint">{query.trim() ? "No people found." : "Search for someone to message."}</p>
          ) : (
            results.map((person) => (
              <button
                key={person.id}
                className="nm-result"
                onClick={() => startConversation(person)}
                disabled={starting}
              >
                {person.avatar_url ? (
                  <img className="nm-avatar" src={person.avatar_url} alt={person.username} referrerPolicy="no-referrer" />
                ) : (
                  <div className="nm-avatar nm-avatar--fallback">{person.username[0]?.toUpperCase()}</div>
                )}
                <span className="nm-username">{person.username}</span>
                <span className="nm-badge">{person.title}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
