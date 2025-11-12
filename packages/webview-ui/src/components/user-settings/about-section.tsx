import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ExternalLink,
  NotebookIcon,
  MessageSquare,
  Github,
} from "lucide-react";
import { useMutation } from "@/hooks/use-query";
import { SERVER_CONFIG } from "@shared/utils/constants";
export default function AboutLinks() {
  const openExternalUrlMutation = useMutation("OPEN_EXTERNAL_URL");

  const handleOpenExternalUrl = (url: string) => {
    openExternalUrlMutation.mutate({ url });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <NotebookIcon className="h-4 w-4" /> About & Links
        </CardTitle>
        <CardDescription>
          Learn more about the app and get support. Read privacy policy and
          terms of service on our webapp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center justify-center">
          <div
            className="w-full justify-start p-2 rounded-full bg-primary/10 flex gap-2 items-center cursor-pointer"
            onClick={() => handleOpenExternalUrl(SERVER_CONFIG.webappUrl)}
          >
            <div className="p-2 rounded-full bg-primary/10">
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
            Web App
          </div>

          <div
            className="w-full justify-start p-2 rounded-full bg-primary/10 flex gap-2 items-center cursor-pointer"
            onClick={() => handleOpenExternalUrl(SERVER_CONFIG.githubUrl)}
          >
            <div className="p-2 rounded-full bg-primary/10">
              <Github className="h-4 w-4 text-primary" />
            </div>
            GitHub
          </div>

          <div
            className="w-full justify-start p-2 rounded-full bg-primary/10 flex gap-2 items-center cursor-pointer"
            onClick={() => handleOpenExternalUrl(SERVER_CONFIG.webappUrl)}
          >
            <div className="p-2 rounded-full bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            Feedback
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
