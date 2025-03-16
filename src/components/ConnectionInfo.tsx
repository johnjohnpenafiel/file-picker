"use client";

import { useConnection } from "@/hooks/useConection";

export default function ConnectionInfo() {
  const { data: connection, isLoading, error } = useConnection();
  console.log(connection);
  if (isLoading) return <p>Loading connection...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!connection) return <p>No Google Drive connection found.</p>;

  return (
    <div>
      <h2>
        <strong>Google Drive Connection</strong>
      </h2>
      <p>
        <strong>ID:</strong> {connection.connection_id}
      </p>
      <p>
        <strong>Organization ID:</strong> {connection.org_id}
      </p>
      <p>
        <strong>Name:</strong> {connection.name}
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(connection.created_at).toLocaleString()}
      </p>
      <p>
        <strong>Last Updated:</strong>{" "}
        {new Date(connection.updated_at).toLocaleString()}
      </p>
    </div>
  );
}
