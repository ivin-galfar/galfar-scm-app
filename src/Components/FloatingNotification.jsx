/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

const FloatingNotification = ({ message, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-6 z-50 -translate-x-1/2 transform animate-slide-down rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white opacity-95 shadow-2xl"
    >
      {message}
    </div>
  );
};

export default FloatingNotification;
