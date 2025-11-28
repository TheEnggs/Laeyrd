import { X } from "lucide-react";
import { memo } from "react";
import { Button } from "../../ui/button";

function Component({
  handleRemove,
  isTouched,
}: {
  handleRemove: () => void;
  isTouched: boolean;
}) {
  if (!isTouched) return null;
  return (
    <Button variant={"ghost"} size={"sm"} className="absolute top-2 right-2">
      <X className="w-4 h-4 text-red-500" onClick={handleRemove} />
    </Button>
  );
}

const RemoveDraftChange = memo(Component);
export default RemoveDraftChange;
