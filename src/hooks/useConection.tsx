"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchConnection() {
  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  if (!accessToken) throw new Error("No access token found");

  const response = await fetch(
    `https://api.stack-ai.com/connections?connection_provider=gdrive&limit=1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch connection: ${response.statusText}`);
  }

  const result = await response.json();

  console.log("Connection API Response:", result);

  return result.length > 0 ? result[0] : null;
}

export function useConnection() {
  return useQuery({
    queryKey: ["connection"],
    queryFn: fetchConnection,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
