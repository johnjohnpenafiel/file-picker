// FETCH FILES
export async function fetchFiles(connectionId: string) {
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

// FETCH FOLDER RESOURCES
export async function fetchFolderResources(
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

// FETCH CONNECTION
export async function fetchConnection() {
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

// CREATE KNOWLEDGE BASE
export async function createKnowledgeBase({
  connectionId,
  selectedResourceIds,
}: {
  connectionId: string;
  selectedResourceIds: string[];
}): Promise<any> {
  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  if (!accessToken) throw new Error("No access token found");

  const data = {
    connection_id: connectionId,
    connection_source_ids: selectedResourceIds,
    name: "Test Knowledge Base 2",
    description: "This is a test knowledge base",
    indexing_params: {
      ocr: false,
      unstructured: true,
      embedding_params: {
        embedding_model: "text-embedding-ada-002",
        api_key: null,
      },
      chunker_params: {
        chunk_size: 1500,
        chunk_overlap: 500,
        chunker: "sentence",
      },
    },
    org_level_role: null,
    cron_job_id: null,
  };

  const response = await fetch(`https://api.stack-ai.com/knowledge_bases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create knowledge base: ${response.statusText}`);
  }

  return await response.json();
}

// SYNC KNOWLEDGE BASE
export async function syncKnowledgeBase({
  knowledgeBaseId,
  organizationId,
}: {
  knowledgeBaseId: string;
  organizationId: string;
}): Promise<any> {
  const accessToken = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  if (!accessToken) throw new Error("No access token found");

  const syncUrl = `https://api.stack-ai.com/knowledge_bases/sync/trigger/${knowledgeBaseId}/${organizationId}`;

  console.log("Syncing knowledge base:", syncUrl);

  const response = await fetch(syncUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to sync knowledge base: ${response.statusText}`);
  }

  const result = await response.json();
  console.log("Knowledge base sync successful:", result);
  return result;
}
