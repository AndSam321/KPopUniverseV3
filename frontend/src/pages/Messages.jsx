import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, ImagePlus, X, PenSquare, Users, SmilePlus } from "lucide-react";
import {
  getConversations,
  getMessages,
  markConversationRead,
  sendMessage,
  toggleReaction,
} from "../api/messagesApi";
import GifPicker from "../components/comments/GifPicker";
import NewMessageModal from "../components/messages/NewMessageModal";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessagesContext";
import "./Messages.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGES = "image/jpeg,image/jpg,image/png,image/gif,image/webp";

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

function ConversationAvatar({ conversation }) {
  if (conversation.group) {
    return (
      <div className="dm-avatar dm-avatar--group">
        <Users size={20} />
      </div>
    );
  }
  return <Avatar user={conversation.other_user} />;
}

const REACTION_EMOJIS = ["💜", "❤️", "😂", "😮", "😢", "🔥", "👍"];

const appendUnique = (list, message) =>
  list.some((m) => m.id === message.id) ? list : [...list, message];

// Toggle my reaction locally; also its own inverse, so it doubles as the revert.
const applyReactionToggle = (reactions, emoji, myId) => {
  const list = reactions || [];
  const existing = list.find((r) => r.emoji === emoji);
  if (existing && existing.user_ids.includes(myId)) {
    const userIds = existing.user_ids.filter((id) => id !== myId);
    if (userIds.length === 0) return list.filter((r) => r.emoji !== emoji);
    return list.map((r) => (r.emoji === emoji ? { ...r, count: userIds.length, user_ids: userIds } : r));
  }
  if (existing) {
    const userIds = [...existing.user_ids, myId];
    return list.map((r) => (r.emoji === emoji ? { ...r, count: userIds.length, user_ids: userIds } : r));
  }
  return [...list, { emoji, count: 1, user_ids: [myId] }];
};

function MessageBubble({ message, mine, isGroup, myId, onToggleReaction }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const longPressRef = useRef(null);
  const startPosRef = useRef(null);

  const cancelLongPress = () => {
    clearTimeout(longPressRef.current);
    longPressRef.current = null;
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse") return; // desktop uses the hover affordance
    startPosRef.current = { x: event.clientX, y: event.clientY };
    longPressRef.current = setTimeout(() => setPickerOpen(true), 450);
  };

  const handlePointerMove = (event) => {
    if (!startPosRef.current) return;
    if (Math.abs(event.clientX - startPosRef.current.x) > 10 || Math.abs(event.clientY - startPosRef.current.y) > 10) {
      cancelLongPress();
    }
  };

  const react = (emoji) => {
    setPickerOpen(false);
    onToggleReaction(message, emoji);
  };

  const reactions = message.reactions || [];

  return (
    <div className={`dm__bubble-row ${mine ? "dm__bubble-row--mine" : ""}`}>
      <div
        className={`dm__bubble ${mine ? "dm__bubble--mine" : ""} ${message.image ? "dm__bubble--media" : ""} ${
          pickerOpen ? "dm__bubble--reacting" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={cancelLongPress}
        onPointerCancel={cancelLongPress}
        onPointerLeave={cancelLongPress}
      >
        {isGroup && !mine && <span className="dm__bubble-sender">{message.sender?.username}</span>}
        {message.image && (
          <a href={message.image.url} target="_blank" rel="noreferrer" className="dm__bubble-media">
            <img src={message.image.thumbnail_url} alt="" referrerPolicy="no-referrer" />
          </a>
        )}
        {message.body && <span className="dm__bubble-text">{message.body}</span>}
        <span className="dm__bubble-time">{timeAgo(message.created_at)}</span>

        <button
          type="button"
          className="dm__react-btn"
          onClick={() => setPickerOpen((open) => !open)}
          aria-label="Add reaction"
        >
          <SmilePlus size={15} />
        </button>

        {pickerOpen && (
          <>
            <div className="dm__react-backdrop" onClick={() => setPickerOpen(false)} />
            <div className="dm__react-picker" role="menu">
              {REACTION_EMOJIS.map((emoji) => (
                <button key={emoji} type="button" className="dm__react-option" onClick={() => react(emoji)}>
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {reactions.length > 0 && (
        <div className="dm__reactions">
          {reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              className={`dm__reaction ${r.user_ids.includes(myId) ? "dm__reaction--mine" : ""}`}
              onClick={() => onToggleReaction(message, r.emoji)}
            >
              <span className="dm__reaction-emoji">{r.emoji}</span>
              <span className="dm__reaction-count">{r.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const conversationPreview = (conversation) => {
  const last = conversation.last_message;
  if (!last) return "Say hi 👋";
  if (last.body) return last.body;
  if (last.image) return last.image.is_gif ? "GIF" : "📷 Photo";
  return "";
};

const upsertConversation = (list, convId, message, openId, myId) => {
  const existing = list.find((c) => c.id === convId);
  if (!existing) return list;
  const isOpen = String(convId) === String(openId);
  const fromMe = message.sender_id === myId;
  const updated = {
    ...existing,
    last_message: message,
    last_message_at: message.created_at,
    unread_count: isOpen || fromMe ? existing.unread_count : (existing.unread_count || 0) + 1,
  };
  return [updated, ...list.filter((c) => c.id !== convId)];
};

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lastEvent, setUnreadCount, sendTyping } = useMessages();

  const [conversations, setConversations] = useState([]);
  const [convPage, setConvPage] = useState(1);
  const [convHasMore, setConvHasMore] = useState(false);

  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [threadPage, setThreadPage] = useState(1);
  const [threadHasMore, setThreadHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const fileInputRef = useRef(null);
  const messagesRef = useRef(null);
  const endRef = useRef(null);
  const listSentinelRef = useRef(null);
  const conversationsRef = useRef([]);
  const conversationIdRef = useRef(conversationId);
  const typingHideRef = useRef(null);
  const typingSentAtRef = useRef(0);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const scrollToBottom = () =>
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "end" }));

  // --- Conversation list (paginated) ---
  const loadConversations = useCallback((page) => {
    return getConversations(page).then((res) => {
      setConversations((prev) =>
        page === 1
          ? res.data
          : [...prev, ...res.data.filter((c) => !prev.some((p) => p.id === c.id))]
      );
      setConvPage(res.pagination.current_page);
      setConvHasMore(res.pagination.current_page < res.pagination.total_pages);
    });
  }, []);

  useEffect(() => {
    loadConversations(1).catch(() => {});
  }, [loadConversations]);

  useEffect(() => {
    if (!convHasMore) return;
    const el = listSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadConversations(convPage + 1).catch(() => {});
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [convHasMore, convPage, loadConversations]);

  // --- Open thread (latest page) ---
  useEffect(() => {
    setPeerTyping(false);
    clearTimeout(typingHideRef.current);
    setBody("");
    setShowGifPicker(false);
    setImageFile(null);
    setGifUrl(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    setLoadingThread(true);
    getMessages(conversationId, 1)
      .then((res) => {
        setMessages(res.data);
        setActiveConversation(res.conversation);
        setThreadPage(res.pagination.current_page);
        setThreadHasMore(res.pagination.current_page < res.pagination.total_pages);
        setConversations((prev) =>
          prev.map((c) => (String(c.id) === String(conversationId) ? { ...c, unread_count: 0 } : c))
        );
        scrollToBottom();
      })
      .catch(() => navigate("/messages"))
      .finally(() => setLoadingThread(false));
  }, [conversationId, navigate]);

  const loadOlder = () => {
    if (!threadHasMore || loadingOlder) return;
    setLoadingOlder(true);
    const container = messagesRef.current;
    const prevHeight = container?.scrollHeight ?? 0;
    getMessages(conversationId, threadPage + 1)
      .then((res) => {
        setMessages((prev) => [...res.data, ...prev]);
        setThreadPage(res.pagination.current_page);
        setThreadHasMore(res.pagination.current_page < res.pagination.total_pages);
        requestAnimationFrame(() => {
          if (container) container.scrollTop = container.scrollHeight - prevHeight;
        });
      })
      .catch(() => {})
      .finally(() => setLoadingOlder(false));
  };

  const handleThreadScroll = (event) => {
    if (event.target.scrollTop < 60) loadOlder();
  };

  // --- Live inbox events (targeted, keeps pagination intact) ---
  useEffect(() => {
    if (!lastEvent) return;
    const openId = conversationIdRef.current;

    if (lastEvent.type === "typing") {
      if (String(lastEvent.conversation_id) === String(openId) && lastEvent.user_id !== user?.id) {
        setPeerTyping(true);
        clearTimeout(typingHideRef.current);
        typingHideRef.current = setTimeout(() => setPeerTyping(false), 3000);
      }
      return;
    }

    if (lastEvent.type === "reaction") {
      if (String(lastEvent.conversation_id) === String(openId)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === lastEvent.message_id ? { ...m, reactions: lastEvent.reactions } : m))
        );
      }
      return;
    }

    if (lastEvent.type === "read") {
      setConversations((prev) =>
        prev.map((c) => (c.id === lastEvent.conversation_id ? { ...c, unread_count: 0 } : c))
      );
      return;
    }
    if (lastEvent.type !== "message") return;

    const { conversation_id: convId, message } = lastEvent;
    if (conversationsRef.current.some((c) => c.id === convId)) {
      setConversations((prev) => upsertConversation(prev, convId, message, openId, user?.id));
    } else {
      loadConversations(1).catch(() => {}); // a brand-new conversation surfaced
    }

    if (String(convId) === String(openId)) {
      setPeerTyping(false);
      clearTimeout(typingHideRef.current);
      setMessages((prev) => appendUnique(prev, message));
      scrollToBottom();
      if (message.sender_id !== user?.id) {
        markConversationRead(convId)
          .then((res) => setUnreadCount(res.unread_count))
          .catch(() => {});
      }
    }
  }, [lastEvent]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleReaction = (message, emoji) => {
    const myId = user?.id;
    const flip = (m) => ({ ...m, reactions: applyReactionToggle(m.reactions, emoji, myId) });
    setMessages((prev) => prev.map((m) => (m.id === message.id ? flip(m) : m)));
    toggleReaction(conversationId, message.id, emoji)
      .then((data) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === data.message_id ? { ...m, reactions: data.reactions } : m))
        )
      )
      .catch(() =>
        setMessages((prev) => prev.map((m) => (m.id === message.id ? flip(m) : m)))
      );
  };

  const handleBodyChange = (event) => {
    setBody(event.target.value);
    const now = Date.now();
    if (conversationId && now - typingSentAtRef.current > 2000) {
      typingSentAtRef.current = now;
      sendTyping(conversationId);
    }
  };

  // Hide the bottom tab bar while a chat thread is open so the composer owns
  // the bottom edge (restored when you leave the conversation).
  useEffect(() => {
    document.body.classList.toggle("dm-thread-active", !!conversationId);
    return () => document.body.classList.remove("dm-thread-active");
  }, [conversationId]);

  // Size the open thread to the *visual* viewport so the header stays pinned
  // and the composer rides above the keyboard — iOS shrinks/pans the visual
  // viewport when the keyboard opens, and matching it keeps the whole chat in
  // the visible area instead of letting the browser scroll the chrome away.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !conversationId) return;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty("--vv-top", `${vv.offsetTop}px`);
      root.style.setProperty("--vv-height", `${vv.height}px`);
    };
    const onResize = () => {
      update();
      scrollToBottom(); // keyboard opened/closed — keep the latest in view
    };
    update();
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", update);
      root.style.removeProperty("--vv-top");
      root.style.removeProperty("--vv-height");
    };
  }, [conversationId]);

  useEffect(() => () => clearTimeout(typingHideRef.current), []);
  useEffect(() => () => imagePreview && URL.revokeObjectURL(imagePreview), [imagePreview]);

  const clearAttachment = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setGifUrl(null);
  };

  const handleFile = (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file || file.size > MAX_IMAGE_SIZE) return;
    clearAttachment();
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGifSelect = (url) => {
    clearAttachment();
    setGifUrl(url);
    setShowGifPicker(false);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const text = body.trim();
    if ((!text && !imageFile && !gifUrl) || sending) return;
    setSending(true);
    try {
      const message = await sendMessage(conversationId, {
        body: text || undefined,
        image: imageFile,
        imageUrl: gifUrl,
      });
      setMessages((prev) => appendUnique(prev, message));
      setConversations((prev) => upsertConversation(prev, message.conversation_id, message, conversationId, user?.id));
      setBody("");
      clearAttachment();
      scrollToBottom();
    } catch {
      // keep the draft so the user can retry
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`dm ${conversationId ? "dm--thread-open" : ""}`}>
      <aside className="dm__list">
        <div className="dm__list-header">
          <h1 className="page-title dm__title">Messages</h1>
          <button
            type="button"
            className="dm__new"
            onClick={() => setShowCompose(true)}
            aria-label="New message"
          >
            <PenSquare size={20} />
          </button>
        </div>
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
                  <ConversationAvatar conversation={conversation} />
                  <span className="dm__conversation-body">
                    <span className="dm__conversation-top">
                      <span className="dm__conversation-name">{conversation.title}</span>
                      {conversation.last_message && (
                        <span className="dm__conversation-time">
                          {timeAgo(conversation.last_message.created_at)}
                        </span>
                      )}
                    </span>
                    <span className="dm__conversation-preview">
                      {conversationPreview(conversation)}
                    </span>
                  </span>
                  {conversation.unread_count > 0 && <span className="dm__unread-dot" />}
                </Link>
              </li>
            ))}
            {convHasMore && <li ref={listSentinelRef} className="dm__list-sentinel" aria-hidden="true" />}
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
              {activeConversation && activeConversation.group && (
                <div className="dm__thread-user">
                  <ConversationAvatar conversation={activeConversation} />
                  <span className="dm__thread-heading">
                    <span className="dm__thread-name">{activeConversation.title}</span>
                    <span className="dm__thread-sub">
                      {activeConversation.participants.map((p) => p.username).join(", ")}
                    </span>
                  </span>
                </div>
              )}
              {activeConversation && !activeConversation.group && (
                <Link to={`/profile/${activeConversation.other_user.username}`} className="dm__thread-user">
                  <Avatar user={activeConversation.other_user} />
                  <span className="dm__thread-name">{activeConversation.other_user.username}</span>
                </Link>
              )}
            </header>

            <div className="dm__messages" ref={messagesRef} onScroll={handleThreadScroll}>
              {loadingOlder && <p className="dm__loading">Loading earlier messages…</p>}
              {loadingThread ? (
                <p className="dm__loading">Loading…</p>
              ) : messages.length === 0 ? (
                <p className="dm__loading">No messages yet. Send the first one!</p>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    mine={message.sender_id === user?.id}
                    isGroup={activeConversation?.group}
                    myId={user?.id}
                    onToggleReaction={handleToggleReaction}
                  />
                ))
              )}
              {peerTyping && (
                <div className="dm__bubble dm__typing" aria-label="typing">
                  <span className="dm__dot" />
                  <span className="dm__dot" />
                  <span className="dm__dot" />
                </div>
              )}
              <div ref={endRef} />
            </div>

            {(imagePreview || gifUrl) && (
              <div className="dm__attachment">
                <img src={imagePreview || gifUrl} alt="attachment preview" referrerPolicy="no-referrer" />
                <button type="button" className="dm__attachment-remove" onClick={clearAttachment} aria-label="Remove attachment">
                  <X size={14} />
                </button>
              </div>
            )}

            <form className="dm__compose" onSubmit={handleSend}>
              <button
                type="button"
                className="dm__compose-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add photo"
              >
                <ImagePlus size={20} />
              </button>
              <div className="dm__gif-wrap">
                <button
                  type="button"
                  className="dm__compose-btn dm__gif-btn"
                  onClick={() => setShowGifPicker((v) => !v)}
                  aria-label="Add GIF"
                >
                  GIF
                </button>
                {showGifPicker && (
                  <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept={ACCEPTED_IMAGES}
                onChange={handleFile}
                hidden
              />
              <input
                type="text"
                className="dm__input"
                placeholder="Message…"
                value={body}
                onChange={handleBodyChange}
                onFocus={scrollToBottom}
                maxLength={5000}
              />
              <button
                type="submit"
                className="dm__send"
                disabled={(!body.trim() && !imageFile && !gifUrl) || sending}
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </section>

      {showCompose && <NewMessageModal onClose={() => setShowCompose(false)} />}
    </div>
  );
}
