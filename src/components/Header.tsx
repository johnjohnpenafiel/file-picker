import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  selectedCount: number;
  currentFolderId: string | null;
  onGoBack: () => void;
  isLoading?: boolean;
}

const Header = ({
  selectedCount,
  currentFolderId,
  onGoBack,
  isLoading = false,
}: HeaderProps) => {
  // Ensure we have a valid selectedCount even if it's undefined
  const count = selectedCount || 0;

  return (
    <div className="flex items-center h-13 mx-5 justify-between px-2 py-3 border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center">
        {currentFolderId ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onGoBack}
            className="flex items-center"
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        ) : (
          <div className="text-sm text-gray-500">Root Directory</div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        {count} item{count !== 1 ? "s" : ""} selected
      </div>
    </div>
  );
};

export default Header;
