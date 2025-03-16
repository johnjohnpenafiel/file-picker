// Utility function to filter out children if a parent folder is selected
// Assuming each resource has a property `inode_path.path` (a string) and a unique `resource_id`
export function filterSelectedResources(resources: any, selectedIds: any) {
  // Get a map of selected resource IDs to their full paths
  const selectedResources = resources.filter((r: any) =>
    selectedIds.has(r.resource_id)
  );
  // Build an array of paths for selected folders (only if the resource is a folder)
  const selectedFolderPaths = selectedResources
    .filter((r: any) => r.inode_type === "directory")
    .map((r: any) => r.inode_path.path);

  // Filter out any resource whose path is a descendant of any selected folder
  return selectedResources.filter((resource: any) => {
    // If it's a folder, always keep it
    if (resource.inode_type === "directory") return true;
    // For files, check if its path starts with any of the selected folder paths
    return !selectedFolderPaths.some((folderPath: any) =>
      resource.inode_path.path.startsWith(`${folderPath}/`)
    );
  });
}
