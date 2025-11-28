import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
export default function ResetSettings({
  handleResetEverything,
}: {
  handleResetEverything: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" /> Reset Settings
        </CardTitle>
        <CardDescription>
          Reset all customizations back to default values
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            onClick={handleResetEverything}
            variant="destructive"
            disabled
            size="sm"
            className="flex items-center gap-2 text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Reset Everything (not implemented
            yet)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
