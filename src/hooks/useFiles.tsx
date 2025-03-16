"use client";

import { fetchFiles } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useFiles(connectionId: string) {
  return useQuery({
    queryKey: ["files", connectionId],
    queryFn: () => fetchFiles(connectionId),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}
