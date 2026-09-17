import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

const ParticularsAccordion = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  if (!Array.isArray(items) || items.length === 0) return "-";

  return (
    <div className="w-64 max-w-full">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-left text-sm font-medium text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <span className="truncate">
          View particulars
          <span className="ml-1.5 text-xs font-normal text-slate-400">
            ({items.filter((item) => item.trim() !== "").length})
          </span>
        </span>
        <FaChevronDown
          className={`h-3 w-3 shrink-0 cursor-pointer transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight : 0,
        }}
      >
        <ul className="mt-1 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-md text-slate-600">
          {items &&
            items
              .filter((item) => item.trim() !== "")
              .map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 whitespace-normal break-words"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
};

export default ParticularsAccordion;
