"use client";

import React, { useState } from "react";
import { useFolderResources } from "@/hooks/useFolderResources";
import { useCreateKnowledgeBase } from "@/hooks/useCreateKnowledgeBase";
import { useSync } from "@/hooks/useSync";
import { filterSelectedResources } from "@/utils/filterSelectedResources";
import { useFileStore } from "@/store/fileStore";
import Footer from "./Footer";
import Resources from "./Resources";

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Get the markFilesAsIndexed function from our file store
  const markFilesAsIndexed = useFileStore((state) => state.markFilesAsIndexed);
  // Get the isFileIndexed and getKnowledgeBaseId functions for selection validation
  const isFileIndexed = useFileStore((state) => state.isFileIndexed);
  const getKnowledgeBaseId = useFileStore((state) => state.getKnowledgeBaseId);

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
          const kbId = getKnowledgeBaseId(resourceId);

          // If we already have selections, validate they're from the same KB
          if (newSet.size > 0) {
            // Check if any existing selection is from a different KB
            for (const id of newSet) {
              if (isFileIndexed(id) && getKnowledgeBaseId(id) !== kbId) {
                // Can't mix files from different knowledge bases
                alert(
                  "Cannot select files from different knowledge bases together"
                );
                return prev; // Return unchanged
              }
            }
          }
        } else {
          // This is a non-indexed file - check if we have indexed files selected
          for (const id of newSet) {
            if (isFileIndexed(id)) {
              // Can't mix indexed and non-indexed files
              alert("Cannot mix indexed and non-indexed files");
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
    const selectedResourceIds = filteredResources.map(
      (r: any) => r.resource_id
    );

    // Update status to creating
    setKbStatus("creating");
    setStatusMessage("Creating knowledge base...");

    try {
      // Create knowledge base
      const result = await createKBMutation.mutateAsync({
        connectionId: connection_id,
        selectedResourceIds,
      });

      // Update status after creation
      setKbStatus("created");
      setStatusMessage(
        `Knowledge base created! ID: ${result.knowledge_base_id}`
      );

      // Update our file store to mark these files as indexed
      markFilesAsIndexed(selectedResourceIds, result.knowledge_base_id);

      // Start sync process
      setKbStatus("syncing");
      setStatusMessage("Synchronizing knowledge base...");

      // Sync the knowledge base
      await syncMutation.mutateAsync({
        knowledgeBaseId: result.knowledge_base_id,
        organizationId: organization_id,
      });

      // Update status after sync
      setKbStatus("synced");
      setStatusMessage("Knowledge base synchronized successfully!");

      // Reset status after 5 seconds
      setTimeout(() => {
        setKbStatus("idle");
        setStatusMessage(null);
        setSelectedIds(new Set());
      }, 5000);
    } catch (error) {
      // Handle errors
      setKbStatus("error");
      setStatusMessage(`Error: ${(error as Error).message}`);
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
      {/* Status messages */}
      {statusMessage && (
        <div
          className={`p-3 mx-4 mt-4 rounded-md text-sm ${
            kbStatus === "error"
              ? "bg-red-50 text-red-600"
              : kbStatus === "synced" || kbStatus === "created"
              ? "bg-green-50 text-green-600"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {statusMessage}
        </div>
      )}

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
