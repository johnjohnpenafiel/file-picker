import { Skeleton } from "@/components/ui/skeleton";

export function ResourceSkeleton() {
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  const itemWidths = ["30%", "40%", "25%", "45%", "35%", "28%", "42%", "38%"];

  return (
    <ul className="divide-y divide-gray-200">
      {skeletonItems.map((item) => (
        <li key={item} className="flex items-center p-3">
          <div className="flex items-center flex-1">
            <div className="h-4 w-4 rounded mr-3 bg-gray-200 animate-pulse" />
            <div className="h-5 w-5 rounded mr-2 bg-gray-200 animate-pulse" />
            <div
              className="h-4 rounded bg-gray-200 animate-pulse"
              style={{ width: itemWidths[item % itemWidths.length] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EmptyFolderSkeleton() {
  return (
    <div className="p-8 text-center">
      <Skeleton className="h-5 w-40 mx-auto" />
    </div>
  );
}
