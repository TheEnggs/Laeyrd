import { Trash, X } from "lucide-react";
import { memo } from "react";
import { Button } from "../../ui/button";
import { cn } from "@webview/lib/utils";

function Component({
  handleRemove,
  className,
  isTouched,
}: {
  handleRemove: () => void;
  className?: string;
  isTouched: boolean;
}) {
  if (!isTouched) {
    return null;
  }
  return (
    <Button
      variant={"destructive"}
      size={"sm"}
      className={cn("absolute top-2 right-2", className)}
      onClick={handleRemove}
    >
      <Trash className="w-4 h-4" />
    </Button>
  );
}

const RemoveDraftChange = memo(Component);
export default RemoveDraftChange;
