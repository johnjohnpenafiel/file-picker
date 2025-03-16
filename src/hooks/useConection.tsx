"use client";

import { fetchConnection } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useConnection() {
  return useQuery({
    queryKey: ["connection"],
    queryFn: fetchConnection,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
