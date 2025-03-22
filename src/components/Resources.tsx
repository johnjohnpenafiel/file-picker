"use client";

import React, { useState, useEffect } from "react";
import ResourceList from "./ResourceList";
import Header from "./Header";

interface ResourcesProps {
  resources: any[];
  currentFolderId: string | null;
  selectedIds: Set<string>;
  onToggleSelect: (resourceId: string) => void;
  onNavigate: (folderId: string) => void;
  onGoRoot: () => void;
  isLoading?: boolean;
  isDeletingFile?: boolean;
}

export default function Resources({
  resources,
  currentFolderId,
  selectedIds,
  onToggleSelect,
  onNavigate,
  onGoRoot,
  isLoading = false,
  isDeletingFile = false,
}: ResourcesProps) {
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const loading = isLoading || internalLoading;

  useEffect(() => {
    if (currentFolderId === null) {
      setNavigationHistory([]);
    } else {
      setNavigationHistory((prev) => {
        if (prev.length > 0 && prev[prev.length - 1] === currentFolderId) {
          return prev;
        }
        return [...prev, currentFolderId];
      });
    }
  }, [currentFolderId]);

  const handleGoBack = () => {
    if (navigationHistory.length <= 1) {
      onGoRoot();
    } else {
      const newHistory = [...navigationHistory];
      newHistory.pop();

      const previousFolderId = newHistory[newHistory.length - 1];
      onNavigate(previousFolderId);

      setNavigationHistory(newHistory.slice(0, -1));
    }
  };

  return (
    <div className="h-full flex flex-col cursor-pointer">
      <Header
        selectedCount={selectedIds.size}
        currentFolderId={currentFolderId}
        onGoBack={handleGoBack}
        isLoading={loading}
      />

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-16">
        <ResourceList
          resources={resources}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onNavigate={onNavigate}
          isLoading={loading}
          isDeletingFile={isDeletingFile}
        />
      </div>
    </div>
  );
}
