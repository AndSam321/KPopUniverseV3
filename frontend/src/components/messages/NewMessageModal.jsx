import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, Check } from "lucide-react";
import { search } from "../../api/searchApi";
import {
  createConversation,
  createGroupConversation,
  getFriends,
} from "../../api/messagesApi";
import { useAuth } from "../../context/AuthContext";
import "./NewMessageModal.css";

function Avatar({ person }) {
  if (person.avatar_url) {
    return <img className="nm-avatar" src={person.avatar_url} alt={person.username} referrerPolicy="no-referrer" />;
  }
  return <div className="nm-avatar nm-avatar--fallback">{person.username[0]?.toUpperCase()}</div>;
}

export default function NewMessageModal({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("chat");
  const [starting, setStarting] = useState(false);

  // chat mode
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // group mode
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const term = query.trim();
    if (mode !== "chat" || !term) {
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
  }, [query, mode, user?.id]);

  useEffect(() => {
    if (mode === "group") getFriends().then(setFriends).catch(() => {});
  }, [mode]);

  const startChat = async (recipient) => {
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

  const toggleFriend = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const createGroup = async () => {
    if (selected.length < 2 || starting) return;
    setStarting(true);
    try {
      const conversation = await createGroupConversation(selected, groupName.trim() || null);
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

        <div className="nm-tabs">
          <button className={`nm-tab ${mode === "chat" ? "is-active" : ""}`} onClick={() => setMode("chat")}>
            Chat
          </button>
          <button className={`nm-tab ${mode === "group" ? "is-active" : ""}`} onClick={() => setMode("group")}>
            Group
          </button>
        </div>

        {mode === "chat" ? (
          <>
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
                  <button key={person.id} className="nm-result" onClick={() => startChat(person)} disabled={starting}>
                    <Avatar person={person} />
                    <span className="nm-username">{person.username}</span>
                    <span className="nm-badge">{person.title}</span>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <input
              className="nm-group-name"
              placeholder="Group name (optional)"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
            />
            <div className="nm-results">
              {friends.length === 0 ? (
                <p className="nm-hint">
                  No friends yet. Follow people and have them follow you back to start a group.
                </p>
              ) : (
                friends.map((friend) => (
                  <button
                    key={friend.id}
                    className={`nm-result ${selected.includes(friend.id) ? "is-selected" : ""}`}
                    onClick={() => toggleFriend(friend.id)}
                  >
                    <Avatar person={friend} />
                    <span className="nm-username">{friend.username}</span>
                    {selected.includes(friend.id) && <Check size={18} className="nm-check" />}
                  </button>
                ))
              )}
            </div>
            <button
              className="nm-create"
              onClick={createGroup}
              disabled={selected.length < 2 || starting}
            >
              Create group{selected.length > 0 ? ` (${selected.length})` : ""}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
