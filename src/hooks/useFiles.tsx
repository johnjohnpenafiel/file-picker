"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchFiles(connectionId: string) {
  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  if (!accessToken) throw new Error("No access token found");

  const response = await fetch(
    `https://api.stack-ai.com/connections/${connectionId}/resources/children`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) throw new Error("Failed to fetch files");

  const result = await response.json();

  console.log("API Response:", result);
  return Array.isArray(result.data)
    ? result.data.map((resource: any) => ({
        ...resource,
        type: resource.inode_type,
        icon: resource.inode_type === "directory" ? "📁" : "📄",
      }))
    : [];
}

export function useFiles(connectionId: string) {
  return useQuery({
    queryKey: ["files", connectionId],
    queryFn: () => fetchFiles(connectionId),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}
