"use client";

import React, { useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFileStore } from "@/store/fileStore";

export default function KnowledgeBaseSelector() {
  // Get the files object to use as a dependency for the useMemo
  const files = useFileStore((state) => state.files);

  // Use the selector to get the function, not the result
  const getAllKnowledgeBases = useFileStore(
    (state) => state.getAllKnowledgeBases
  );

  // Then call the function and memoize the result, with files as a dependency
  const knowledgeBases = useMemo(
    () => getAllKnowledgeBases(),
    [getAllKnowledgeBases, files]
  );

  const selectedKnowledgeBaseId = useFileStore(
    (state) => state.selectedKnowledgeBaseId
  );
  const setSelectedKnowledgeBase = useFileStore(
    (state) => state.setSelectedKnowledgeBase
  );

  // Handle selection change
  const handleSelectionChange = (value: string) => {
    setSelectedKnowledgeBase(value === "all" ? null : value);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Knowledge Base:
      </span>
      <Select
        value={selectedKnowledgeBaseId || "all"}
        onValueChange={handleSelectionChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Knowledge Base" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Files</SelectItem>
          {knowledgeBases.map((kbId) => (
            <SelectItem key={kbId} value={kbId}>
              {kbId.substring(0, 8)}...
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
