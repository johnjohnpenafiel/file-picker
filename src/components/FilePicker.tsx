"use client";

import { useFolderResources } from "@/hooks/useFolderResources";
import { useState } from "react";

export default function FilePicker() {
  const connection_id = process.env.NEXT_PUBLIC_CONNECTION_ID;
  if (!connection_id) throw new Error("No connection ID found");

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const {
    data: resources,
    isLoading,
    error,
  } = useFolderResources(connection_id, currentFolderId);

  if (isLoading) return <p>Loading folder contents...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button
        onClick={() => setCurrentFolderId(null)}
        disabled={!currentFolderId}
      >
        Go to Root
      </button>

      <ul>
        {resources.map((item: any) => (
          <li key={item.resource_id}>
            {/* If it's a folder, clicking sets that folder as current */}
            {item.icon}{" "}
            {item.inode_type === "directory" ? (
              <button onClick={() => setCurrentFolderId(item.resource_id)}>
                {item.inode_path.path}
              </button>
            ) : (
              <span>{item.inode_path.path}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// TODO: This is the old file picker that uses the useFiles hook

// export default function FilePicker() {
//   const connection_id = process.env.NEXT_PUBLIC_CONNECTION_ID;
//   if (!connection_id) throw new Error("No connection ID found");
//   const { data: files, isLoading, error } = useFiles(connection_id);

//   if (isLoading) return <p>Loading files...</p>;
//   if (error) return <p>Error loading files: {error.message}</p>;

//   return (
//     <div className="flex flex-col gap-4">
//       <h2 className="text-2xl font-bold">Files: Available resources</h2>
//       <ul>
//         {files.map((file: any) => (
//           <li key={file.resource_id}>
//             {file.icon} {file.inode_path.path}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
