"use client";

import { syncKnowledgeBase } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useSync() {
  return useMutation({
    mutationFn: syncKnowledgeBase,
    onSuccess: (data) => {
      console.log("Knowledge base sync completed successfully:", data);
    },
    onError: (error) => {
      console.error("Knowledge base sync failed:", error);
    },
  });
}
