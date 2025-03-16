"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchFolderResources } from "@/lib/api";

export function useFolderResources(
  connectionId: string,
  folderId: string | null
) {
  return useQuery({
    queryKey: ["folderResources", connectionId, folderId],
    queryFn: () => fetchFolderResources(connectionId, folderId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
