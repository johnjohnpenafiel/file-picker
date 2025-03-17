"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ResourceSkeleton } from "./Skeleton";
import { useFileStore } from "@/store/fileStore";
import { GoFileDirectory } from "react-icons/go";
import { GoFile } from "react-icons/go";

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

  // Get the selected knowledge base and knowledge base IDs function
  const selectedKnowledgeBaseId = useFileStore(
    (state) => state.selectedKnowledgeBaseId
  );
  const getKnowledgeBaseIds = useFileStore(
    (state) => state.getKnowledgeBaseIds
  );

  if (isLoading) {
    return <ResourceSkeleton />;
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">This folder is empty</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {resources.map((resource: any) => {
        const resourceId = resource.resource_id;
        const isDirectory = resource.inode_type === "directory";
        const isIndexed = isFileIndexed(resourceId);
        const path = resource.inode_path.path;

        // Get all knowledge base IDs for this resource
        const knowledgeBaseIds = getKnowledgeBaseIds(resourceId);

        // Check if this resource is in the selected knowledge base
        const isInSelectedKb = selectedKnowledgeBaseId
          ? knowledgeBaseIds.includes(selectedKnowledgeBaseId)
          : isIndexed; // If no KB selected, highlight all indexed files

        // Simplified highlight style - only highlight files in selected KB
        const highlightStyle = isInSelectedKb
          ? "text-blue-500" // In selected KB - blue
          : "text-gray-400 dark:text-gray-500"; // Not in selected KB - default

        return (
          <div
            key={resourceId}
            className={`flex items-center p-2 rounded-md ${
              selectedIds.has(resourceId)
                ? "bg-blue-100 dark:bg-blue-900"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onDoubleClick={() => {
              if (isDirectory) {
                onNavigate(resourceId);
              }
            }}
            onClick={() => {
              console.log(path);
              console.log(resourceId);
            }}
          >
            <div
              className="flex-shrink-0 mr-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={selectedIds.has(resourceId)}
                onCheckedChange={() => onToggleSelect(resourceId)}
                className="h-4 w-4"
              />
            </div>

            <div className="flex-grow flex items-center">
              <div className="flex-shrink-0 mr-3">
                {isDirectory ? (
                  <GoFileDirectory className={`h-5 w-5 ${highlightStyle}`} />
                ) : (
                  <GoFile className={`h-5 w-5 ${highlightStyle}`} />
                )}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center">
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                    title={resource.inode_path.path}
                  >
                    {resource.inode_path.path.split("/").pop() ||
                      resource.inode_path.path}
                  </p>
                  {isIndexed && (
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        isInSelectedKb
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                      title={`Knowledge Base IDs: ${knowledgeBaseIds.join(
                        ", "
                      )}`}
                    >
                      {selectedKnowledgeBaseId && isInSelectedKb
                        ? "Selected KB"
                        : `${knowledgeBaseIds.length} KB${
                            knowledgeBaseIds.length !== 1 ? "s" : ""
                          }`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
