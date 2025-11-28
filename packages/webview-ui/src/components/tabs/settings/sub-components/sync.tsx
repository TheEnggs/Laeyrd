import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Palette, RefreshCw, XCircleIcon } from "lucide-react";
import { useMutation } from "@/hooks/use-query";
import { ConflictResolvedResponse, SyncResponse } from "@shared/types/sync";
import useToast from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function SyncThemesCard() {
  const toast = useToast();
  const [syncResponse, setSyncResponse] = useState<SyncResponse[] | null>(null);
  const [conflictResolution, setConflictResolution] =
    useState<ConflictResolvedResponse | null>(null);
  const [conflictIndex, setConflictIndex] = useState(0);

  const { mutate: sync, isPending } = useMutation("SYNC", {
    onSuccess: (data) => setSyncResponse(data.data),
    onError: (err) => {
      (console.error("Sync error:", err),
        toast({
          message: "Sync Failed, " + err,
          type: "error",
        }));
    },
  });
  const { mutate: resolveConflict, isPending: resolvingConflict } = useMutation(
    "RESOLVE_CONFLICT",
    {
      onSuccess: (data) => {
        // Convert to Record
        const resultMap = data.data.reduce<
          Record<string, { success: boolean; error?: string }>
        >((acc, e) => {
          acc[e.fileId] = { success: e.success, error: e.error };
          return acc;
        }, {});

        setSyncResponse(
          (prev) =>
            prev?.map((p) => {
              const result = resultMap[p.fileId];
              if (!result) return p;
              return result.success
                ? { ...p, resolve: true }
                : { ...p, resolvedError: result.error };
            }) ?? []
        );
      },
    }
  );
  // Flatten conflicts into an array for the carousel
  const conflicts: SyncResponse[] = syncResponse
    ? syncResponse.filter((r) => r.status === "CONFLICT")
    : [];

  const handleResolveConflict = (keep: "local" | "remote") => {
    // setConflictResolution((prev) => ({ ...prev, [conflictIndex]: keep }));
    setConflictIndex((prev) => prev + 1);
  };

  const renderCleanFiles = () => {
    if (!syncResponse) return null;

    return (
      <div className="mt-2 space-y-1">
        <div className="p-2 border rounded-md">
          <strong className="capitalize">
            {syncResponse.length} files synced
          </strong>
          <ul className="list-disc list-inside mt-1">
            {syncResponse
              .filter((r) => r.status !== "CONFLICT")
              .map((r, idx) => (
                <li key={idx}>
                  {r.status === "PUSHED" && (
                    <span className="text-green-600">✅ {r.fileName}</span>
                  )}
                  {r.status === "PULLED" && (
                    <span className="text-blue-600">⬇️ {r.fileName}</span>
                  )}
                  {r.status === "UP_TO_DATE" && (
                    <span className="text-gray-600">⚪ {r.fileName}</span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderConflictCarousel = () => {
    if (conflictIndex >= conflicts.length) return null;

    const conflict = conflicts[conflictIndex];

    return (
      <div className="p-4 border rounded-md mt-4">
        <div className="mb-2 font-semibold">
          Resolving conflict: {conflict.fileName} ({conflictIndex + 1}/
          {conflicts.length})
        </div>
        <div className="flex gap-4">
          <div className="flex-1 border p-2 rounded-md overflow-auto max-h-40">
            <div className="font-semibold mb-1">Local</div>
            <pre className="text-sm">{conflict.fileContent}</pre>
          </div>
          <div className="flex-1 border p-2 rounded-md overflow-auto max-h-40">
            <div className="font-semibold mb-1">Remote</div>
            <pre className="text-sm">{conflict.remoteFileContent}</pre>
          </div>
        </div>
        {conflict.resolved !== -1 ? (
          <div>
            <Badge>
              {conflict.resolved ? <CheckCircle2 /> : <XCircleIcon />}
            </Badge>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => handleResolveConflict("local")}>
              Keep Local
            </Button>
            <Button size="sm" onClick={() => handleResolveConflict("remote")}>
              Keep Remote
            </Button>
          </div>
        )}
        {/* <Button size="sm" onClick={resolveConflict()}/> */}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-6">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Sync Configuration
          </CardTitle>
          <CardDescription>
            Syncing enables cross-device environment portability
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => sync({})} disabled={isPending}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isPending ? "Syncing..." : "Sync All"}
          </Button>
        </div>
      </CardHeader>
      {syncResponse && (
        <CardContent>
          {renderCleanFiles()}
          {renderConflictCarousel()}
        </CardContent>
      )}
    </Card>
  );
}
