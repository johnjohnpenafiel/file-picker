"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderIcon, FileIcon, Database } from "lucide-react";
import { ResourceSkeleton } from "./Skeleton";
import { useFileStore } from "@/store/fileStore";
import { useState } from "react";
import { LuFileUp } from "react-icons/lu";

import { LuFolderUp } from "react-icons/lu";

interface ResourceListProps {
  resources: any[];
  selectedIds: Set<string>;
  onToggleSelect: (resourceId: string) => void;
  onNavigate: (folderId: string) => void;
  isLoading?: boolean;
}

export default function ResourceList({
  resources,
  selectedIds,
  onToggleSelect,
  onNavigate,
  isLoading = false,
}: ResourceListProps) {
  // Get file state functions from our store - use individual selectors
  const isFileIndexed = useFileStore((state) => state.isFileIndexed);
  const getKnowledgeBaseId = useFileStore((state) => state.getKnowledgeBaseId);
  const directoryContainsIndexedFiles = useFileStore(
    (state) => state.directoryContainsIndexedFiles
  );
  const isDirectoryIndexed = useFileStore((state) => state.isDirectoryIndexed);

  // State for showing KB ID on hover
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  if (isLoading) {
    return <ResourceSkeleton />;
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">This folder is empty</div>
    );
  }

  const handleDoubleClick = (resource: any) => {
    if (resource.inode_type === "directory") {
      onNavigate(resource.resource_id);
    }
  };

  return (
    <ul className="divide-y divide-gray-200">
      {resources.map((resource: any) => {
        const resourceId = resource.resource_id;
        const isDirectory = resource.inode_type === "directory";
        const isIndexed = isFileIndexed(resourceId);
        const knowledgeBaseId = getKnowledgeBaseId(resourceId);
        const directoryHasIndexedFiles =
          isDirectory &&
          directoryContainsIndexedFiles(resource.inode_path.path);
        const directoryIsIndexed =
          isDirectory && isDirectoryIndexed(resourceId);

        // Determine styling based on indexing status
        const fileStatusClass = isIndexed
          ? "border-l-2 border-l-inner border-green-500"
          : directoryHasIndexedFiles || directoryIsIndexed
          ? "border-l-2 border-l-inner border-blue-300"
          : "";

        return (
          <li
            key={resourceId}
            className={`flex items-center p-3 hover:bg-gray-50 `}
            onDoubleClick={() => handleDoubleClick(resource)}
            onMouseEnter={() => setHoveredFile(resourceId)}
            onMouseLeave={() => setHoveredFile(null)}
            onClick={() => {
              onToggleSelect(resourceId);
              console.log("Resource ID:", resourceId);
              console.log("Selected IDs:", selectedIds);
              console.log("Is Indexed:", isIndexed);
              console.log("Knowledge Base ID:", knowledgeBaseId);
              console.log(
                "Directory Has Indexed Files:",
                directoryHasIndexedFiles
              );
              console.log("inode_type:", resource.inode_type);
            }}
          >
            <div className="flex items-center flex-1">
              <Checkbox
                id={resourceId}
                checked={selectedIds.has(resourceId)}
                onCheckedChange={() => onToggleSelect(resourceId)}
                className="mr-3"
                onClick={(e) => e.stopPropagation()}
              />

              {isDirectory ? (
                directoryHasIndexedFiles || directoryIsIndexed ? (
                  <LuFolderUp className="h-5 w-5 mr-2 text-blue-400" />
                ) : (
                  <FolderIcon className="h-5 w-5 mr-2 text-blue-400" />
                )
              ) : (
                <div className="relative">
                  {isIndexed ? (
                    <LuFileUp className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <FileIcon className={`h-5 w-5 mr-2 text-gray-500`} />
                  )}
                </div>
              )}

              <span className="text-sm font-medium text-gray-700 truncate">
                {resource.inode_path.path.split("/").pop() ||
                  resource.inode_path.path}
              </span>

              {/* Show knowledge base ID on hover for indexed files */}
              {isIndexed &&
                hoveredFile === resourceId &&
                knowledgeBaseId !== "00000000-0000-0000-0000-000000000000" && (
                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 rounded">
                    KB: {knowledgeBaseId?.substring(0, 8)}...
                  </span>
                )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
