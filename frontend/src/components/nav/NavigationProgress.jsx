import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigationLoading } from "../../context/NavigationLoadingContext";
import "./NavigationProgress.css";

export default function NavigationProgress() {
  const { isLoading } = useNavigationLoading();
  const [state, setState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    if (isLoading && state === "idle") {
      clearTimers();
      setState("loading");
      setProgress(15);
      addTimer(() => setProgress(30), 80);
      addTimer(() => setProgress(50), 250);
      addTimer(() => setProgress(65), 500);
      addTimer(() => setProgress(75), 1000);
      addTimer(() => setProgress(82), 2000);
      addTimer(() => setProgress(88), 4000);
    } else if (!isLoading && state === "loading") {
      clearTimers();
      setProgress(100);
      setState("completing");
      addTimer(() => {
        setState("idle");
        setProgress(0);
      }, 700);
    }
  }, [isLoading, state, clearTimers, addTimer]);

  if (state === "idle") return null;

  return (
    <div className={`nav-progress nav-progress--${state}`}>
      <div
        className="nav-progress__bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
