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
import { deleteFileFromKnowledgeBase } from "@/lib/api";

// Define the possible states for the knowledge base creation process
type KnowledgeBaseStatus =
  | "idle"
  | "creating"
  | "created"
  | "syncing"
  | "synced"
  | "error"
  | "deleting";

// Add type for resources
interface Resource {
  resource_id: string;
  inode_path: {
    path: string;
  };
  inode_type: "file" | "directory";
}

export default function FilePicker() {
  // Hardcoded connection ID
  const connection_id = process.env.NEXT_PUBLIC_CONNECTION_ID;
  if (!connection_id) throw new Error("No connection ID found");

  const organization_id = process.env.NEXT_PUBLIC_ORGANIZATION_ID;
  if (!organization_id) throw new Error("No organization ID found");

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [kbStatus, setKbStatus] = useState<KnowledgeBaseStatus>("idle");

  // Get the store functions
  const markFilesAsIndexed = useFileStore((state) => state.markFilesAsIndexed);
  const isFileIndexed = useFileStore((state) => state.isFileIndexed);
  const getKnowledgeBaseIds = useFileStore(
    (state) => state.getKnowledgeBaseIds
  );
  const selectedKnowledgeBaseId = useFileStore(
    (state) => state.selectedKnowledgeBaseId
  );
  const isDeletingFile = useFileStore((state) => state.isDeletingFile);
  const setDeletingFile = useFileStore((state) => state.setDeletingFile);
  const clearDeletingFile = useFileStore((state) => state.clearDeletingFile);
  const removeFileFromKnowledgeBase = useFileStore(
    (state) => state.removeFileFromKnowledgeBase
  );

  const {
    data: resources = [],
    isLoading,
    error,
    refetch,
  } = useFolderResources(connection_id, currentFolderId);

  const createKBMutation = useCreateKnowledgeBase();
  const syncMutation = useSync();

  // Enhanced toggle select with validation for knowledge base consistency
  const handleToggleSelect = (resourceId: string) => {
    // If we're in a specific knowledge base view
    if (selectedKnowledgeBaseId) {
      // If we're already deleting a file, prevent new selections
      if (isDeletingFile && !selectedIds.has(resourceId)) {
        return;
      }

      if (selectedIds.has(resourceId)) {
        // Unselecting
        setSelectedIds(new Set());
        clearDeletingFile();
      } else {
        // Selecting new file
        setSelectedIds(new Set([resourceId]));
        // Use setTimeout to avoid the state update during render
        setTimeout(() => setDeletingFile(resourceId), 0);
      }
      return;
    }

    // In "All Files" mode, allow selecting any file
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (!newSet.has(resourceId)) {
        newSet.add(resourceId);
      } else {
        newSet.delete(resourceId);
      }
      return newSet;
    });
  };

  const handleNavigate = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSelectedIds(new Set());
    clearDeletingFile();
  };

  const handleGoRoot = () => {
    setCurrentFolderId(null);
    setSelectedIds(new Set());
    clearDeletingFile();
  };

  const handleDeleteFile = async (resourceId: string) => {
    if (!selectedKnowledgeBaseId) return;

    setKbStatus("deleting");
    try {
      const resource = resources.find(
        (r: Resource) => r.resource_id === resourceId
      );
      if (!resource) {
        throw new Error("Resource not found");
      }

      await deleteFileFromKnowledgeBase({
        knowledgeBaseId: selectedKnowledgeBaseId,
        resourcePath: resource.inode_path.path,
      });

      // Update local state
      removeFileFromKnowledgeBase(resourceId, selectedKnowledgeBaseId);
      setSelectedIds(new Set());
      clearDeletingFile();
      toast.success("File removed from knowledge base");

      // Refresh the resource list
      await refetch();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete file from knowledge base"
      );
    } finally {
      setKbStatus("idle");
    }
  };

  const handleCreateKnowledgeBase = async () => {
    const filteredResources = filterSelectedResources(resources, selectedIds);
    const selectedResourceIds = filteredResources.map(
      (r: Resource) => r.resource_id
    );

    setKbStatus("creating");

    try {
      const result = await createKBMutation.mutateAsync({
        connectionId: connection_id,
        selectedResourceIds,
      });

      setKbStatus("created");
      markFilesAsIndexed(selectedResourceIds, result.knowledge_base_id);
      setKbStatus("syncing");

      await syncMutation.mutateAsync({
        knowledgeBaseId: result.knowledge_base_id,
        organizationId: organization_id,
      });

      setKbStatus("synced");
      toast.success("Knowledge base synchronized successfully!");
      setSelectedIds(new Set());
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
        isDeletingFile={isDeletingFile}
      />

      {selectedIds.size > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <Footer
            selectedCount={selectedIds.size}
            onCancel={() => {
              setSelectedIds(new Set());
              clearDeletingFile();
            }}
            onSelect={
              selectedKnowledgeBaseId
                ? () => handleDeleteFile(Array.from(selectedIds)[0])
                : handleCreateKnowledgeBase
            }
            isLoading={
              kbStatus === "creating" ||
              kbStatus === "syncing" ||
              kbStatus === "deleting"
            }
            disabled={kbStatus !== "idle"}
            status={kbStatus}
            mode={selectedKnowledgeBaseId ? "delete" : "create"}
          />
        </div>
      )}
    </div>
  );
}
