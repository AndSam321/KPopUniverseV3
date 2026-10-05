import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getConsumer } from "../api/cable";
import { getUnreadMessageCount } from "../api/messagesApi";
import { useAuth } from "./AuthContext";

const MessagesContext = createContext({
  unreadCount: 0,
  lastEvent: null,
  setUnreadCount: () => {},
  sendTyping: () => {},
});

export function MessagesProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const subscriptionRef = useRef(null);

  // Authoritative unread count from the server on login.
  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    let active = true;
    getUnreadMessageCount()
      .then((count) => active && setUnreadCount(count))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user?.id]);

  // One shared InboxChannel subscription drives the badge and live thread events.
  useEffect(() => {
    if (!user?.id) return;
    const subscription = getConsumer().subscriptions.create("InboxChannel", {
      received(data) {
        if (typeof data.unread_count === "number") setUnreadCount(data.unread_count);
        setLastEvent(data);
      },
    });
    subscriptionRef.current = subscription;
    return () => {
      subscription.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [user?.id]);

  const sendTyping = useCallback((conversationId) => {
    subscriptionRef.current?.perform("typing", { conversation_id: conversationId });
  }, []);

  return (
    <MessagesContext.Provider value={{ unreadCount, setUnreadCount, lastEvent, sendTyping }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = () => useContext(MessagesContext);
