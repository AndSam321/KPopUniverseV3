import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ALLOWED_PATHS = ["/onboarding", "/privacy"];

const OnboardingGate = () => {
  const { user, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const needsOnboarding = !loading && user && !user.onboarded_at;

  useEffect(() => {
    if (needsOnboarding && !ALLOWED_PATHS.includes(pathname)) {
      navigate("/onboarding", { replace: true });
    }
  }, [needsOnboarding, pathname, navigate]);

  return null;
};

export default OnboardingGate;
