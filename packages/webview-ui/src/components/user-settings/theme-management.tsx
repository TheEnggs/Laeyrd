import { useMutation, useQuery } from "@/hooks/use-query";
import useToast from "@/hooks/use-toast";
import { log } from "@shared/utils/debug-logs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Palette } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
export default function ThemeManagement() {
  const toast = useToast();
  const {
    data: themesData,
    refetch,
    isLoading,
  } = useQuery({
    command: "GET_THEME_LIST",
    payload: [],
  });

  const { mutate: deleteTheme, isPending: isDeleting } = useMutation(
    "DELETE_THEME",
    {
      onSuccess: async () => {
        await refetch();
        toast({ message: "Theme deleted", type: "success" });
      },
      onError: (error) => {
        log(error);
        toast({ message: "Failed to delete theme", type: "error" });
      },
    }
  );
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Your Themes
        </CardTitle>
        <CardDescription>
          List of themes you have created and saved
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => <Skeleton key={i} />)
        ) : themesData && themesData.themes.length > 0 ? (
          <div
            className={cn(
              "grid gap-6 grid-cols-1",
              themesData.themes.length >= 3
                ? "xl:grid-cols-3 md:grid-cols-2"
                : themesData.themes.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-1"
            )}
          >
            {themesData.themes.map((theme) => (
              <div
                key={theme.label}
                className="flex items-center justify-between p-4 border border-primary/20 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{theme.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {theme.uiTheme === "vs" ? "Dark" : "Light"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={() => deleteTheme({ themeName: theme.label })}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-primary/60 bg-muted/10 rounded-lg shadow-sm">
            <p className="text-center text-sm text-muted-foreground">
              No themes found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
