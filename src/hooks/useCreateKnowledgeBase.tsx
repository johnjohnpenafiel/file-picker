"use client";

import { useMutation } from "@tanstack/react-query";
import { createKnowledgeBase } from "@/lib/api";

interface CreateKBVariables {
  connectionId: string;
  selectedResourceIds: string[];
}

export function useCreateKnowledgeBase() {
  return useMutation<any, Error, CreateKBVariables>({
    mutationFn: createKnowledgeBase,
    onSuccess: (data) => {
      // Here 'data' is the API response from createKnowledgeBase
      console.log("Knowledge Base created successfully:", data);
      // Log the knowledge base ID if it exists
      console.log("Knowledge Base ID:", data?.knowledge_base_id);
    },
  });
}
