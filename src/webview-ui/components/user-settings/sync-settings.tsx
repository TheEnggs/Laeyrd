import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import { Switch } from "@webview/components/ui/switch";
import { Code, NotebookIcon, Palette, Settings, Layout } from "lucide-react";
import { UserConsents } from "@src/types/user-preferences";
export default function SyncSettings({
  userPreferences,
  handleConsentChange,
  authUser,
}: {
  userPreferences: any;
  handleConsentChange: (
    consentType: keyof UserConsents,
    value: boolean
  ) => void;
  authUser: any;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <NotebookIcon className="h-4 w-4" /> Sync Settings
        </CardTitle>
        <CardDescription>Sync your settings across devices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            {
              icon: Palette,
              title: "Themes",
              description: "Sync custom themes and color schemes",
              consent: "dataSyncEnabled" as keyof UserConsents,
            },
            {
              icon: Code,
              title: "Extensions",
              description: "Sync installed extensions and their settings",
              consent: "readSettingsEnabled" as keyof UserConsents,
            },
            {
              icon: Settings,
              title: "Keybindings",
              description: "Sync custom keyboard shortcuts",
              consent: "termsAccepted" as keyof UserConsents,
            },
            {
              icon: Layout,
              title: "Workspace Settings",
              description: "Sync workspace configurations and preferences",
              consent: "privacyPolicyAccepted" as keyof UserConsents,
            },
            {
              icon: NotebookIcon,
              title: "Snippets",
              description: "Sync custom code snippets",
              consent: "marketingOptIn" as keyof UserConsents,
            },
          ].map(({ icon: Icon, title, description, consent }) => (
            <div
              key={consent}
              className="flex items-center justify-between p-3 border border-border/40 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <Switch
                checked={userPreferences?.consents?.[consent] || false}
                onCheckedChange={(checked) =>
                  handleConsentChange(consent, checked)
                }
                disabled={!authUser?.isSignedIn}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
