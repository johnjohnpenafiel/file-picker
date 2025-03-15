"use client";
import { useQuery } from "@tanstack/react-query";

async function fetchFolderResources(
  connectionId: string,
  folderId: string | null
) {
  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  if (!accessToken) throw new Error("No access token found");

  let url = `https://api.stack-ai.com/connections/${connectionId}/resources/children`;
  if (folderId) {
    url += `?resource_id=${folderId}`;
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch folder resources");

  const result = await response.json();

  return Array.isArray(result.data)
    ? result.data.map((resource: any) => ({
        ...resource,
        icon: resource.inode_type === "directory" ? "📁" : "📄",
      }))
    : [];
}

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
