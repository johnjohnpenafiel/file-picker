"use client";

import React from "react";
import { FaGoogleDrive } from "react-icons/fa";

export default function Sidebar() {
  return (
    <div className="w-64 border-r h-full border-gray-200 bg-muted overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-200 text-sm font-medium text-gray-700">
        Integrations
      </div>
      <ul className="py-2">
        <li
          className={`px-4 py-2 flex items-center text-sm font-medium cursor-pointer bg-sidebar-foreground/5`}
        >
          <FaGoogleDrive className="mr-3 h-5 w-5" />
          Google Drive
        </li>
      </ul>
    </div>
  );
}
