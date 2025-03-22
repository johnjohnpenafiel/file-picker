"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type KnowledgeBaseStatus =
  | "idle"
  | "creating"
  | "created"
  | "syncing"
  | "synced"
  | "error"
  | "deleting";

interface FooterProps {
  selectedCount?: number;
  onCancel?: () => void;
  onSelect?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  status?: KnowledgeBaseStatus;
  mode?: "create" | "delete";
}

export default function Footer({
  selectedCount = 0,
  onCancel,
  onSelect,
  isLoading = false,
  disabled = false,
  status = "idle",
  mode = "create",
}: FooterProps) {
  // Determine button text based on status and mode
  const getButtonText = () => {
    if (mode === "delete") {
      if (status === "deleting") return "Removing File...";
      return `Remove ${selectedCount} file${selectedCount !== 1 ? "s" : ""}`;
    } else {
      if (status === "creating") return "Creating Knowledge Base...";
      if (status === "syncing") return "Synchronizing...";
      return `Select ${selectedCount} file${selectedCount !== 1 ? "s" : ""}`;
    }
  };

  return (
    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end items-center flex-shrink-0">
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant={mode === "delete" ? "destructive" : "default"}
          size="sm"
          onClick={onSelect}
          disabled={disabled || selectedCount === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {getButtonText()}
            </>
          ) : (
            getButtonText()
          )}
        </Button>
      </div>
    </div>
  );
}
