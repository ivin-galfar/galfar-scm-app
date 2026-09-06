import { HandBag01FreeIcons } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { FaHandsHolding } from "react-icons/fa6";
import { LuMoonStar, LuCloudSun } from "react-icons/lu";
import {
  PiHandArrowDownFill,
  PiHandWavingBold,
  PiHandWavingFill,
  PiSunDimBold,
} from "react-icons/pi";

const Greetings = ({ userName }) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good Morning",
        icon: LuCloudSun,
        iconColor: "text-yellow-500",
        period: "morning",
      };
    }

    if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good Afternoon",
        icon: PiSunDimBold,
        iconColor: "text-amber-500",
        period: "afternoon",
      };
    }

    return {
      greeting: "Good Evening",
      icon: LuMoonStar,
      iconColor: "text-indigo-500",
      period: "evening",
    };
  };

  const { greeting, icon: GreetingIcon, iconColor, period } = getGreetingData();

  useEffect(() => {
    const storageKey = `greetingShown:${userName}:${period}`;
    const greetingShown = sessionStorage.getItem(storageKey);

    if (greetingShown) {
      return;
    }

    setShouldShow(true);
    sessionStorage.setItem(storageKey, "true");
  }, [period, userName]);

  const formatName = (name = "") => {
    if (!name) return "";

    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {!isAnimated && shouldShow && (
        <div
          className="
            fixed inset-0 z-40
            flex items-start justify-center pt-20
            pointer-events-none
          "
        >
          <div
            className="
              animate-in fade-in
              duration-700 ease-out
            "
          >
            <div
              className="
                inline-flex items-center gap-2
                px-4 py-2
                rounded-2xl
                bg-gradient-to-r from-green-50 to-emerald-50
                border border-green-200/60
                shadow-md shadow-green-100/50
                backdrop-blur-sm
              "
            >
              <GreetingIcon className={`w-4 h-4 ${iconColor}`} />
              <span className="text-sm font-semibold text-green-700 tracking-tight">
                {greeting}, {formatName(userName)}
                <span>👋</span>{" "}
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        className={`
          transition-all duration-1000 ease-in-out
          ${
            isAnimated || !shouldShow
              ? "animate-in fade-in duration-700 opacity-100"
              : "opacity-0 pointer-events-none"
          }
          inline-flex items-center gap-1.5
          px-2 py-1
          rounded-2xs
          bg-transparent
      `}
      >
        <span className="rounded-2xs  gap-2 bg-indigo-50   border border-border/70  px-3 py-1  text-xs font-semibold tracking-tight shadow-sm text-indigo-600 flex justify-center items-center">
          <GreetingIcon className={` ${iconColor}`} size={20} />
          {greeting}, {formatName(userName)}
        </span>
        <span className="text-2xl">👋</span>{" "}
      </div>
    </>
  );
};

export default Greetings;
