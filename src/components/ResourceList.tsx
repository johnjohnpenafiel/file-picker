"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderIcon, FileIcon } from "lucide-react";
import { ResourceSkeleton } from "./Skeleton";

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
      {resources.map((resource: any) => (
        <li
          key={resource.resource_id}
          className={`flex items-center p-3 hover:bg-gray-50 ${
            resource.inode_type === "directory" ? "cursor-pointer" : ""
          }`}
          onDoubleClick={() => handleDoubleClick(resource)}
        >
          <div className="flex items-center flex-1">
            <Checkbox
              id={resource.resource_id}
              checked={selectedIds.has(resource.resource_id)}
              onCheckedChange={() => onToggleSelect(resource.resource_id)}
              className="mr-3"
              onClick={(e) => e.stopPropagation()}
            />

            {resource.inode_type === "directory" ? (
              <FolderIcon className="h-5 w-5 text-blue-500 mr-2" />
            ) : (
              <FileIcon className="h-5 w-5 text-gray-500 mr-2" />
            )}

            <span className="text-sm font-medium text-gray-700 truncate">
              {resource.inode_path.path.split("/").pop() ||
                resource.inode_path.path}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
