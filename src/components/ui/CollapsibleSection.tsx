"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  collapsedContent?: React.ReactNode;
}

export function CollapsibleSection({ 
  title, 
  icon, 
  defaultOpen = true, 
  children,
  collapsedContent
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-700/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {!isOpen && collapsedContent && (
              <div className="flex items-center gap-2 ml-auto">
                {collapsedContent}
              </div>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
}

