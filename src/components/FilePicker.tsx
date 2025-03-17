"use client";

import React, { useState } from "react";
import { useFolderResources } from "@/hooks/useFolderResources";
import { useCreateKnowledgeBase } from "@/hooks/useCreateKnowledgeBase";
import { useSync } from "@/hooks/useSync";
import { filterSelectedResources } from "@/utils/filterSelectedResources";
import { useFileStore } from "@/store/fileStore";
import Footer from "./Footer";
import Resources from "./Resources";
import KnowledgeBaseSelector from "./KnowledgeBaseSelector";
import { toast } from "sonner";

// Define the possible states for the knowledge base creation process
type KnowledgeBaseStatus =
  | "idle"
  | "creating"
  | "created"
  | "syncing"
  | "synced"
  | "error";

export default function FilePicker() {
  // Hardcoded connection ID
  const connection_id = process.env.NEXT_PUBLIC_CONNECTION_ID;
  if (!connection_id) throw new Error("No connection ID found");

  const organization_id = process.env.NEXT_PUBLIC_ORGANIZATION_ID;
  if (!organization_id) throw new Error("No organization ID found");

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [kbStatus, setKbStatus] = useState<KnowledgeBaseStatus>("idle");

  // Get the markFilesAsIndexed function from our file store
  const markFilesAsIndexed = useFileStore((state) => state.markFilesAsIndexed);
  // Get the isFileIndexed, getKnowledgeBaseIds, and selectedKnowledgeBaseId functions for selection validation
  const isFileIndexed = useFileStore((state) => state.isFileIndexed);
  const getKnowledgeBaseIds = useFileStore(
    (state) => state.getKnowledgeBaseIds
  );
  const selectedKnowledgeBaseId = useFileStore(
    (state) => state.selectedKnowledgeBaseId
  );

  const {
    data: resources = [],
    isLoading,
    error,
  } = useFolderResources(connection_id, currentFolderId);

  const createKBMutation = useCreateKnowledgeBase();
  const syncMutation = useSync();

  // Enhanced toggle select with validation for knowledge base consistency
  const handleToggleSelect = (resourceId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);

      // If we're adding a file
      if (!newSet.has(resourceId)) {
        // Check if this is an indexed file
        if (isFileIndexed(resourceId)) {
          const kbIds = getKnowledgeBaseIds(resourceId);

          // If we have a selected knowledge base, only allow selection of files from that KB
          if (selectedKnowledgeBaseId) {
            if (!kbIds.includes(selectedKnowledgeBaseId)) {
              toast.error("This file is not in the selected knowledge base");
              return prev; // Return unchanged
            }
          } else {
            // If no KB is selected but we already have selections, validate they're compatible
            if (newSet.size > 0) {
              // Check if any existing selection is from a different KB
              for (const id of newSet) {
                if (isFileIndexed(id)) {
                  const existingKbIds = getKnowledgeBaseIds(id);
                  // Check if there's at least one common KB
                  const hasCommonKb = existingKbIds.some((kbId) =>
                    kbIds.includes(kbId)
                  );
                  if (!hasCommonKb) {
                    toast.error(
                      "Cannot select files from different knowledge bases together"
                    );
                    return prev; // Return unchanged
                  }
                }
              }
            }
          }
        } else {
          // This is a non-indexed file - check if we have indexed files selected
          for (const id of newSet) {
            if (isFileIndexed(id)) {
              // Can't mix indexed and non-indexed files
              toast.error("Cannot mix indexed and non-indexed files");
              return prev; // Return unchanged
            }
          }
        }

        // If we passed validation, add the file
        newSet.add(resourceId);
      } else {
        // If we're removing a file, just remove it
        newSet.delete(resourceId);
      }

      return newSet;
    });
  };

  const handleNavigate = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSelectedIds(new Set());
  };

  const handleGoRoot = () => {
    setCurrentFolderId(null);
    setSelectedIds(new Set());
  };

  const handleCreateKnowledgeBase = async () => {
    const filteredResources = filterSelectedResources(resources, selectedIds);
    console.log(filterSelectedResources);
    const selectedResourceIds = filteredResources.map(
      (r: any) => r.resource_id
    );

    setKbStatus("creating");

    try {
      const result = await createKBMutation.mutateAsync({
        connectionId: connection_id,
        selectedResourceIds,
      });

      setKbStatus("created");

      // Update our file store to mark these files as indexed
      markFilesAsIndexed(selectedResourceIds, result.knowledge_base_id);

      setKbStatus("syncing");

      // Sync the knowledge base
      await syncMutation.mutateAsync({
        knowledgeBaseId: result.knowledge_base_id,
        organizationId: organization_id,
      });

      setKbStatus("synced");
      toast.success("Knowledge base synchronized successfully!");
      setSelectedIds(new Set());
      // Reset status after 5 seconds
      setTimeout(() => {
        setKbStatus("idle");
      }, 5000);
    } catch (error) {
      setKbStatus("error");
      toast.error("Knowledge base operation failed!");
      console.error("Knowledge base operation failed:", error);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            <p>Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <Resources
        resources={resources}
        currentFolderId={currentFolderId}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onNavigate={handleNavigate}
        onGoRoot={handleGoRoot}
        isLoading={isLoading}
      />

      {selectedIds.size > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <Footer
            selectedCount={selectedIds.size}
            onCancel={() => setSelectedIds(new Set())}
            onSelect={handleCreateKnowledgeBase}
            isLoading={kbStatus === "creating" || kbStatus === "syncing"}
            disabled={kbStatus !== "idle"}
            status={kbStatus}
          />
        </div>
      )}
    </div>
  );
}
