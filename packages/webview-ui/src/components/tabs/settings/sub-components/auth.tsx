import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Copy, CloudCheck } from "lucide-react";
/** ------------------- Auth Section ------------------- */
export default function AuthSection() {
  //   const { authUser, signIn, signOut, deviceFlow } = useAuth();

  //   const openExternalUrlMutation = useMutation("OPEN_EXTERNAL_URL");

  //   const handleOpenExternalUrl = (url: string) => {
  //     openExternalUrlMutation.mutate({ url });
  //   };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Account
        </CardTitle>
        <CardDescription>
          Manage your account and Sync your setup across devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* <div className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
            {authUser?.isSignedIn ? (
              <div className="flex items-center gap-3">
                <img
                  src={authUser.imageUrl}
                  alt="User"
                  className="h-16 w-16 border border-border/40 rounded-full"
                />
                <div>
                  <p className="font-medium">
                    Welcome back, {authUser.firstName} {authUser.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    github: {authUser.username}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Not signed in</p>
                  <p className="text-sm text-muted-foreground">
                    Sign in to sync your preferences across devices
                  </p>
                </div>
              </div>
            )}
            {!authUser?.isSignedIn ? (
              <Button size="sm" className="gap-2" onClick={signIn}>
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            ) : (
              <Button size="sm" className="gap-2" onClick={signOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            )}
          </div> */}

          {/* {deviceFlow && (
            <div className="flex flex-col gap-4 p-4 border-2 border-primary/60 bg-muted/10 rounded-lg shadow-sm">
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold tracking-widest bg-background px-3 py-1 rounded border border-primary/40 select-all">
                    {deviceFlow.user_code}
                  </span>
                  <button
                    className="px-2 py-1 text-xs rounded bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary"
                    onClick={() => {
                      navigator.clipboard.writeText(deviceFlow.user_code);
                    }}
                    title="Copy code"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      handleOpenExternalUrl(deviceFlow.verificationUri)
                    }
                  >
                    <LogIn className="h-4 w-4" /> Authenticate
                  </Button>
                  <div className="flex items-end gap-2 max-w-32">
                    <span className="flex-1 text-xs text-muted-foreground truncate">
                      {deviceFlow.verificationUri}
                    </span>
                    <Copy
                      size={14}
                      className="shrink-0 cursor-pointer text-primary"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          deviceFlow.verificationUri
                        )
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="self-end flex items-center gap-2 text-xs text-muted-foreground">
                <span>Expires in</span>
                <CountdownTimer expiresIn={deviceFlow.expiresIn} />
              </div>
            </div>
          )} */}
          <div className="w-full justify-start p-2 rounded-full bg-primary/10 flex gap-2 items-center cursor-pointer">
            <div className="p-2 rounded-full bg-primary/10">
              <CloudCheck className="h-4 w-4 text-primary" />
            </div>
            Sync feature coming soon!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
