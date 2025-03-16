"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchFolderResources } from "@/lib/api";
import { useFileStore } from "@/store/fileStore";

export function useFolderResources(
  connectionId: string,
  folderId: string | null
) {
  // Access the file store
  const mergeResources = useFileStore((state) => state.mergeResources);

  return useQuery({
    queryKey: ["folderResources", connectionId, folderId],
    queryFn: async () => {
      // Fetch resources from the API
      const resources = await fetchFolderResources(connectionId, folderId);

      // Merge the fetched resources with our file store
      // This preserves knowledge base associations and status
      mergeResources(resources);

      // Return the resources for the component to use
      return resources;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
