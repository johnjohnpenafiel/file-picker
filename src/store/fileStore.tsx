import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the file status types
export type FileStatus = "resource" | "indexed";
export type FileType = "file" | "directory";

// Define the file state interface
export interface FileState {
  resource_id: string;
  knowledge_base_ids: string[];
  status: FileStatus;
  path?: string;
  size?: number;
  inode_type?: FileType;
  last_modified?: string;
  indexed_directory?: boolean;
}

// Define the store state interface
interface FileStoreState {
  // Map of resource_id to FileState
  files: Record<string, FileState>;

  // Selected knowledge base ID
  selectedKnowledgeBaseId: string | null;

  // Set selected knowledge base
  setSelectedKnowledgeBase: (knowledgeBaseId: string | null) => void;

  // CRUD operations
  getFileState: (resourceId: string) => FileState | undefined;
  updateFileState: (
    resourceId: string,
    partialState: Partial<FileState>
  ) => void;
  resetFileState: (resourceId: string) => void;
  batchUpdateFileStates: (updates: Record<string, Partial<FileState>>) => void;

  // Knowledge base operations
  markFilesAsIndexed: (resourceIds: string[], knowledgeBaseId: string) => void;
  markFilesAsResource: (resourceIds: string[]) => void;

  // New knowledge base management methods
  getAllKnowledgeBases: () => string[];
  removeFileFromKnowledgeBase: (
    resourceId: string,
    knowledgeBaseId: string
  ) => void;

  // Helper functions
  isFileIndexed: (resourceId: string) => boolean;
  getKnowledgeBaseId: (resourceId: string) => string | undefined;
  getKnowledgeBaseIds: (resourceId: string) => string[];
  getFilesByKnowledgeBase: (knowledgeBaseId: string) => FileState[];

  // Directory helpers
  directoryContainsIndexedFiles: (directoryPath: string) => boolean;

  // Merge new resources with existing state
  mergeResources: (resources: any[]) => void;

  // Renamed helper function
  isDirectoryIndexed: (resourceId: string) => boolean;
}

// Create the store with persistence
export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => ({
      files: {},
      selectedKnowledgeBaseId: null,

      // Set selected knowledge base
      setSelectedKnowledgeBase: (knowledgeBaseId) => {
        set({ selectedKnowledgeBaseId: knowledgeBaseId });
      },

      // Get file state by resource ID
      getFileState: (resourceId) => {
        return get().files[resourceId];
      },

      // Update a file's state
      updateFileState: (resourceId, partialState) => {
        set((state) => ({
          files: {
            ...state.files,
            [resourceId]: {
              ...state.files[resourceId],
              ...partialState,
            },
          },
        }));
      },

      // Reset a file to default state
      resetFileState: (resourceId) => {
        set((state) => {
          const { [resourceId]: _, ...rest } = state.files;
          return { files: rest };
        });
      },

      // Batch update multiple files
      batchUpdateFileStates: (updates) => {
        set((state) => {
          const updatedFiles = { ...state.files };

          Object.entries(updates).forEach(([resourceId, partialState]) => {
            updatedFiles[resourceId] = {
              ...updatedFiles[resourceId],
              ...partialState,
            };
          });

          return { files: updatedFiles };
        });
      },

      // Mark multiple files as indexed in a knowledge base
      markFilesAsIndexed: (resourceIds, knowledgeBaseId) => {
        set((state) => {
          const updates: Record<string, Partial<FileState>> = {};

          resourceIds.forEach((resourceId) => {
            const existingFile = state.files[resourceId];

            // Check if this is a directory
            if (existingFile && existingFile.inode_type === "directory") {
              // For directories, associate with KB and mark as indexed directory
              updates[resourceId] = {
                // Add to knowledge_base_ids array instead of replacing
                knowledge_base_ids: [
                  ...(existingFile.knowledge_base_ids || []).filter(
                    (id) =>
                      id !== knowledgeBaseId &&
                      id !== "00000000-0000-0000-0000-000000000000"
                  ),
                  knowledgeBaseId,
                ],
                indexed_directory: true,
                // Keep status as "resource"
              };
            } else {
              // For files or if we don't know the type yet, mark as indexed
              updates[resourceId] = {
                // Add to knowledge_base_ids array instead of replacing
                knowledge_base_ids: [
                  ...(existingFile?.knowledge_base_ids || []).filter(
                    (id) =>
                      id !== knowledgeBaseId &&
                      id !== "00000000-0000-0000-0000-000000000000"
                  ),
                  knowledgeBaseId,
                ],
                status: "indexed",
              };
            }
          });

          return {
            files: {
              ...state.files,
              ...Object.fromEntries(
                Object.entries(updates).map(([id, update]) => [
                  id,
                  {
                    ...state.files[id],
                    ...update,
                  },
                ])
              ),
            },
          };
        });
      },

      // Mark multiple files as resources (not indexed)
      markFilesAsResource: (resourceIds) => {
        set((state) => {
          const updates: Record<string, Partial<FileState>> = {};

          resourceIds.forEach((resourceId) => {
            updates[resourceId] = {
              knowledge_base_ids: ["00000000-0000-0000-0000-000000000000"],
              status: "resource",
            };
          });

          return {
            files: {
              ...state.files,
              ...Object.fromEntries(
                Object.entries(updates).map(([id, update]) => [
                  id,
                  {
                    ...state.files[id],
                    ...update,
                  },
                ])
              ),
            },
          };
        });
      },

      // Check if a file is indexed
      isFileIndexed: (resourceId) => {
        const file = get().files[resourceId];
        // Check if file is indexed in any knowledge base
        return (
          file?.status === "indexed" &&
          file?.knowledge_base_ids?.some(
            (id) => id !== "00000000-0000-0000-0000-000000000000"
          )
        );
      },

      // Get a file's knowledge base ID (for backward compatibility)
      getKnowledgeBaseId: (resourceId) => {
        const file = get().files[resourceId];
        // Return the first non-default knowledge base ID
        return file?.knowledge_base_ids?.find(
          (id) => id !== "00000000-0000-0000-0000-000000000000"
        );
      },

      // Get all knowledge base IDs for a file
      getKnowledgeBaseIds: (resourceId) => {
        const file = get().files[resourceId];
        // Return all non-default knowledge base IDs
        return (
          file?.knowledge_base_ids?.filter(
            (id) => id !== "00000000-0000-0000-0000-000000000000"
          ) || []
        );
      },

      // Get all files in a knowledge base
      getFilesByKnowledgeBase: (knowledgeBaseId) => {
        return Object.values(get().files).filter((file) =>
          file.knowledge_base_ids?.includes(knowledgeBaseId)
        );
      },

      // Get all unique knowledge base IDs in the system
      getAllKnowledgeBases: () => {
        const knowledgeBaseIds = new Set<string>();

        Object.values(get().files).forEach((file) => {
          if (file.knowledge_base_ids) {
            file.knowledge_base_ids.forEach((id) => {
              // Don't include the default ID
              if (id !== "00000000-0000-0000-0000-000000000000") {
                knowledgeBaseIds.add(id);
              }
            });
          }
        });

        return Array.from(knowledgeBaseIds);
      },

      // Remove a file from a specific knowledge base
      removeFileFromKnowledgeBase: (resourceId, knowledgeBaseId) => {
        set((state) => {
          const file = state.files[resourceId];
          if (!file) return state;

          // Remove the knowledge base ID from the array
          const updatedKnowledgeBaseIds =
            file.knowledge_base_ids?.filter((id) => id !== knowledgeBaseId) ||
            [];

          // If no knowledge bases left, mark as resource
          const updatedStatus =
            updatedKnowledgeBaseIds.length === 0 ||
            (updatedKnowledgeBaseIds.length === 1 &&
              updatedKnowledgeBaseIds[0] ===
                "00000000-0000-0000-0000-000000000000")
              ? "resource"
              : file.status;

          // If it's empty, add the default ID
          if (updatedKnowledgeBaseIds.length === 0) {
            updatedKnowledgeBaseIds.push(
              "00000000-0000-0000-0000-000000000000"
            );
          }

          return {
            files: {
              ...state.files,
              [resourceId]: {
                ...file,
                knowledge_base_ids: updatedKnowledgeBaseIds,
                status: updatedStatus,
                // If it's a directory and no longer in any KB, unmark it
                indexed_directory:
                  file.inode_type === "directory" &&
                  updatedKnowledgeBaseIds.some(
                    (id) => id !== "00000000-0000-0000-0000-000000000000"
                  )
                    ? file.indexed_directory
                    : false,
              },
            },
          };
        });
      },

      // Check if a directory contains indexed files
      directoryContainsIndexedFiles: (directoryPath) => {
        // Make sure directoryPath ends with a slash for proper prefix matching
        const normalizedPath = directoryPath.endsWith("/")
          ? directoryPath
          : directoryPath + "/";

        return Object.values(get().files).some(
          (file) =>
            file.status === "indexed" &&
            file.path &&
            (file.path.startsWith(normalizedPath) ||
              file.path === directoryPath)
        );
      },

      // Merge new resources with existing state
      mergeResources: (resources) => {
        set((state) => {
          const updates: Record<string, FileState> = {};

          resources.forEach((resource) => {
            const resourceId = resource.resource_id;
            const existingFile = state.files[resourceId];

            // Determine the file type
            const fileType: FileType =
              resource.inode_type === "directory" ? "directory" : "file";

            // Create or update file state
            updates[resourceId] = {
              // If file exists, preserve its knowledge_base_ids and status
              ...(existingFile || {
                knowledge_base_ids: ["00000000-0000-0000-0000-000000000000"],
                status: "resource",
              }),
              // Always update these properties from the resource
              resource_id: resourceId,
              path: resource.inode_path?.path,
              inode_type: fileType,
              // Add any other metadata from resource
              size: resource.size,
              last_modified: resource.last_modified,
            };
          });

          return {
            files: {
              ...state.files,
              ...updates,
            },
          };
        });
      },

      // Renamed helper function to check if a directory was indexed
      isDirectoryIndexed: (resourceId) => {
        const file = get().files[resourceId];
        return (
          file?.inode_type === "directory" && file?.indexed_directory === true
        );
      },
    }),
    {
      name: "file-store", // Name for localStorage
      partialize: (state) => ({ files: state.files }), // Only persist the files object
    }
  )
);
