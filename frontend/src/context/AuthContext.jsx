import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { getMyProfile } from "../api/userApi";
import { getConsumer, resetConsumer } from "../api/cable";
import ProfileToast from "../components/profile/ProfileToast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getMyProfile();
        setUser(userData);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
        localStorage.removeItem("authToken");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Live profile progression (points, title, badges) over ActionCable
  useEffect(() => {
    if (!user?.id) return;

    const subscription = getConsumer().subscriptions.create("ProfileChannel", {
      received(data) {
        if (data.type !== "profile") return;

        const prev = userRef.current;
        if (prev) {
          const earned = new Set((prev.badges || []).map((badge) => badge.key));
          const newBadge = (data.badges || []).find((badge) => !earned.has(badge.key));
          if (newBadge) {
            setToast({ message: `you earned the ${newBadge.name} badge!`, variant: "success" });
          } else if (data.title && data.title !== prev.title) {
            setToast({ message: `you reached ${data.title}!`, variant: "success" });
          }
        }

        setUser((current) =>
          current
            ? {
                ...current,
                idol_points: data.idol_points,
                title: data.title,
                points_info: data.points_info,
                badges: data.badges,
              }
            : current
        );
      },
    });

    return () => subscription.unsubscribe();
  }, [user?.id]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    resetConsumer();
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
      {toast && (
        <ProfileToast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
