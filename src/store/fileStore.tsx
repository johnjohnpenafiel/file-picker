import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the file status types
export type FileStatus = "resource" | "indexed";
export type FileType = "file" | "directory";

// Define the file state interface
export interface FileState {
  resource_id: string;
  knowledge_base_id: string;
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

  // Helper functions
  isFileIndexed: (resourceId: string) => boolean;
  getKnowledgeBaseId: (resourceId: string) => string | undefined;
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
                knowledge_base_id: knowledgeBaseId,
                indexed_directory: true,
                // Keep status as "resource"
              };
            } else {
              // For files or if we don't know the type yet, mark as indexed
              updates[resourceId] = {
                knowledge_base_id: knowledgeBaseId,
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
              knowledge_base_id: "00000000-0000-0000-0000-000000000000",
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
        return file?.status === "indexed";
      },

      // Get a file's knowledge base ID
      getKnowledgeBaseId: (resourceId) => {
        const file = get().files[resourceId];
        return file?.knowledge_base_id;
      },

      // Get all files in a knowledge base
      getFilesByKnowledgeBase: (knowledgeBaseId) => {
        return Object.values(get().files).filter(
          (file) => file.knowledge_base_id === knowledgeBaseId
        );
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
              // If file exists, preserve its knowledge_base_id and status
              ...(existingFile || {
                knowledge_base_id: "00000000-0000-0000-0000-000000000000",
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
