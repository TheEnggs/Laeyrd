import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const ColorSettingsSkeleton = () => {
  return (
    <div className="space-y-6 mt-6">
      {Array.from({ length: 2 }).map((_, tabIdx) => (
        <Card
          key={tabIdx}
          className={cn(
            "bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden relative",
            tabIdx === 1 &&
              "after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-card"
          )}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 w-5 h-5 animate-pulse" />
              <div className="h-5 w-32 bg-primary/20 rounded animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {Array.from({ length: 5 }).map((_, colorIdx) => (
                <div key={colorIdx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-primary/20 rounded animate-pulse" />
                      <div className="h-3 w-40 bg-primary/10 rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-12 bg-primary/20 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-full bg-primary/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
