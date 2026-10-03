import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import {
  getConversations,
  getMessages,
  markConversationRead,
  sendMessage,
} from "../api/messagesApi";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessagesContext";
import "./Messages.css";

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function Avatar({ user }) {
  if (user?.avatar_url) {
    return <img className="dm-avatar" src={user.avatar_url} alt={user.username} referrerPolicy="no-referrer" />;
  }
  return <div className="dm-avatar dm-avatar--fallback">{user?.username?.[0]?.toUpperCase() || "?"}</div>;
}

const appendUnique = (list, message) =>
  list.some((m) => m.id === message.id) ? list : [...list, message];

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lastEvent, setUnreadCount } = useMessages();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const fetchConversations = useCallback(() => {
    getConversations().then((res) => setConversations(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load the open thread
  useEffect(() => {
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    setLoadingThread(true);
    getMessages(conversationId)
      .then((res) => {
        setMessages(res.data);
        setActiveConversation(res.conversation);
        setConversations((prev) =>
          prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, unread_count: 0 } : c))
        );
      })
      .catch(() => navigate("/messages"))
      .finally(() => setLoadingThread(false));
  }, [conversationId, navigate]);

  // React to live inbox events
  useEffect(() => {
    if (!lastEvent) return;
    fetchConversations();
    if (lastEvent.type === "message" && String(lastEvent.conversation_id) === String(conversationId)) {
      setMessages((prev) => appendUnique(prev, lastEvent.message));
      if (lastEvent.message.sender_id !== user?.id) {
        markConversationRead(conversationId)
          .then((res) => setUnreadCount(res.unread_count))
          .catch(() => {});
      }
    }
  }, [lastEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const message = await sendMessage(conversationId, text);
      setMessages((prev) => appendUnique(prev, message));
      setBody("");
      fetchConversations();
    } catch {
      // keep the draft so the user can retry
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`dm ${conversationId ? "dm--thread-open" : ""}`}>
      <aside className="dm__list">
        <h1 className="page-title dm__title">Messages</h1>
        {conversations.length === 0 ? (
          <p className="dm__empty">No conversations yet.</p>
        ) : (
          <ul className="dm__conversations">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  to={`/messages/${conversation.id}`}
                  className={`dm__conversation ${
                    String(conversation.id) === String(conversationId) ? "is-active" : ""
                  }`}
                >
                  <Avatar user={conversation.other_user} />
                  <span className="dm__conversation-body">
                    <span className="dm__conversation-top">
                      <span className="dm__conversation-name">{conversation.other_user.username}</span>
                      {conversation.last_message && (
                        <span className="dm__conversation-time">
                          {timeAgo(conversation.last_message.created_at)}
                        </span>
                      )}
                    </span>
                    <span className="dm__conversation-preview">
                      {conversation.last_message?.body || "Say hi 👋"}
                    </span>
                  </span>
                  {conversation.unread_count > 0 && <span className="dm__unread-dot" />}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="dm__thread">
        {!conversationId ? (
          <div className="dm__placeholder">Select a conversation to start chatting.</div>
        ) : (
          <>
            <header className="dm__thread-header">
              <button className="dm__back" onClick={() => navigate("/messages")} aria-label="Back">
                <ArrowLeft size={20} />
              </button>
              {activeConversation && (
                <Link to={`/profile/${activeConversation.other_user.username}`} className="dm__thread-user">
                  <Avatar user={activeConversation.other_user} />
                  <span className="dm__thread-name">{activeConversation.other_user.username}</span>
                </Link>
              )}
            </header>

            <div className="dm__messages">
              {loadingThread ? (
                <p className="dm__loading">Loading…</p>
              ) : messages.length === 0 ? (
                <p className="dm__loading">No messages yet. Send the first one!</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`dm__bubble ${message.sender_id === user?.id ? "dm__bubble--mine" : ""}`}
                  >
                    <span className="dm__bubble-text">{message.body}</span>
                    <span className="dm__bubble-time">{timeAgo(message.created_at)}</span>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            <form className="dm__compose" onSubmit={handleSend}>
              <input
                type="text"
                className="dm__input"
                placeholder="Message…"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                maxLength={5000}
              />
              <button type="submit" className="dm__send" disabled={!body.trim() || sending} aria-label="Send">
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
