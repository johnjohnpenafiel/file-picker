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
  | "error";

interface FooterProps {
  selectedCount?: number;
  onCancel?: () => void;
  onSelect?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  status?: KnowledgeBaseStatus;
}

export default function Footer({
  selectedCount = 0,
  onCancel,
  onSelect,
  isLoading = false,
  disabled = false,
  status = "idle",
}: FooterProps) {
  // Determine button text based on status
  const getButtonText = () => {
    if (status === "creating") return "Creating Knowledge Base...";
    if (status === "syncing") return "Synchronizing...";
    if (selectedCount > 0) return `Select ${selectedCount}`;
    return "Select";
  };

  return (
    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end items-center flex-shrink-0">
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="default"
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
