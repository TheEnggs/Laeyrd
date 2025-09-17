import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import { Button } from "@webview/components/ui/button";
import { Switch } from "@webview/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@webview/components/ui/select";
import { Badge } from "@webview/components/ui/badge";
import { Alert, AlertDescription } from "@webview/components/ui/alert";
import {
  RotateCcw,
  LogIn,
  LogOut,
  User,
  Code,
  Shield,
  ExternalLink,
  Check,
  NotebookIcon,
  Palette,
  Settings,
  Layout,
  MessageSquare,
  Github,
} from "lucide-react";
import { useQuery, useMutation } from "@webview/hooks/use-query";
import { useAuth } from "./auth-provider";
import {
  UserPreferences,
  PROGRAMMING_LANGUAGES,
  FRAMEWORKS,
  UserConsents,
  ServerConfig,
} from "../../types/user-preferences";
import { log } from "../../lib/debug-logs";

export default function UserSettingsContent() {
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [selectedSecondaryLangs, setSelectedSecondaryLangs] = useState<
    string[]
  >([]);

  // Use Clerk authentication
  const {
    authUser,
    isLoading: isAuthLoading,
    signIn,
    signOut,
    authSession,
  } = useAuth();

  // Fetch user preferences and server config
  const { data: userPreferences, isLoading: isLoadingPreferences } = useQuery({
    command: "GET_USER_PREFERENCES",
    payload: null,
  });

  const { data: serverConfig } = useQuery({
    command: "GET_SERVER_CONFIG",
    payload: null,
  });

  // Refresh preferences helper
  const refreshPreferences = () => {
    // Force re-fetch by updating a state that triggers useEffect
    window.location.reload(); // Simple refresh for now
  };

  // Update preferences mutation
  const updatePreferencesMutation = useMutation("UPDATE_USER_PREFERENCES");
  const openExternalUrlMutation = useMutation("OPEN_EXTERNAL_URL");

  // Initialize state from loaded preferences
  useEffect(() => {
    if (userPreferences) {
      setSelectedFrameworks(
        userPreferences.programmingLanguage?.frameworks || []
      );
      setSelectedSecondaryLangs(
        userPreferences.programmingLanguage?.secondary || []
      );
    }
  }, [userPreferences]);

  const handleResetEverything = () => {
    // TODO: Implement reset functionality
    log("Reset everything clicked");
  };

  const handlePrimaryLanguageChange = (language: string) => {
    updatePreferencesMutation.mutate({
      programmingLanguage: {
        primary: language,
        secondary: userPreferences?.programmingLanguage?.secondary || [],
        frameworks: userPreferences?.programmingLanguage?.frameworks || [],
      },
    });
    refreshPreferences();
  };

  const handleConsentChange = (
    consentType: keyof UserConsents,
    value: boolean
  ) => {
    updatePreferencesMutation.mutate({
      consents: {
        dataSyncEnabled: userPreferences?.consents?.dataSyncEnabled || false,
        readSettingsEnabled:
          userPreferences?.consents?.readSettingsEnabled || false,
        analyticsEnabled: userPreferences?.consents?.analyticsEnabled || false,
        crashReportingEnabled:
          userPreferences?.consents?.crashReportingEnabled || false,
        marketingOptIn: userPreferences?.consents?.marketingOptIn || false,
        termsAccepted: userPreferences?.consents?.termsAccepted || false,
        privacyPolicyAccepted:
          userPreferences?.consents?.privacyPolicyAccepted || false,
        lastUpdated: new Date().toISOString(),
        ...userPreferences?.consents,
        [consentType]: value,
      },
    });
    refreshPreferences();
  };

  const handleOpenExternalUrl = (url: string) => {
    openExternalUrlMutation.mutate({ url });
  };

  if (isLoadingPreferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading preferences...</div>
      </div>
    );
  }
  log(authUser, isAuthLoading, authSession);
  return (
    <div className="space-y-6">
      {/* Account Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </CardTitle>
          <CardDescription>
            Manage your account and authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Authentication Status */}
            <div className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
              {authUser?.isSignedIn ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Welcome back, {authUser.firstName} {authUser.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      github: {authUser.githubUsername}
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
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              ) : (
                <Button size="sm" className="gap-2" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>

            {/* Sync Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Sync Settings
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Palette className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Themes</p>
                      <p className="text-xs text-muted-foreground">
                        Sync custom themes and color schemes
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={
                      userPreferences?.consents?.dataSyncEnabled || false
                    }
                    onCheckedChange={(checked) =>
                      handleConsentChange("dataSyncEnabled", checked)
                    }
                    disabled={!authUser?.isSignedIn}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Code className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Extensions</p>
                      <p className="text-xs text-muted-foreground">
                        Sync installed extensions and their settings
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={
                      userPreferences?.consents?.readSettingsEnabled || false
                    }
                    onCheckedChange={(checked) =>
                      handleConsentChange("readSettingsEnabled", checked)
                    }
                    disabled={!authUser?.isSignedIn}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Keybindings</p>
                      <p className="text-xs text-muted-foreground">
                        Sync custom keyboard shortcuts
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={userPreferences?.consents?.termsAccepted || false}
                    onCheckedChange={(checked) =>
                      handleConsentChange("termsAccepted", checked)
                    }
                    disabled={!authUser?.isSignedIn}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Layout className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Workspace Settings</p>
                      <p className="text-xs text-muted-foreground">
                        Sync workspace configurations and preferences
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={
                      userPreferences?.consents?.privacyPolicyAccepted || false
                    }
                    onCheckedChange={(checked) =>
                      handleConsentChange("privacyPolicyAccepted", checked)
                    }
                    disabled={!authUser?.isSignedIn}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <NotebookIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Snippets</p>
                      <p className="text-xs text-muted-foreground">
                        Sync custom code snippets
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={userPreferences?.consents?.marketingOptIn || false}
                    onCheckedChange={(checked) =>
                      handleConsentChange("marketingOptIn", checked)
                    }
                    disabled={!authUser?.isSignedIn}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programming Language Preferences */}
      {/* <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Programming Languages
          </CardTitle>
          <CardDescription>
            Customize theme based on your programming languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Primary Language
            <div className="space-y-3">
              <label className="text-sm font-medium">Primary Language</label>
              <Select
                value={
                  userPreferences?.programmingLanguage?.primary || "javascript"
                }
                onValueChange={handlePrimaryLanguageChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary language" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMING_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💻</span>
                        <span>{lang}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Languages
            <div className="space-y-3">
              <label className="text-sm font-medium">Secondary Languages</label>
              <Select
                value={selectedSecondaryLangs[0] || ""}
                onValueChange={(value) => {
                  if (value && !selectedSecondaryLangs.includes(value)) {
                    setSelectedSecondaryLangs([
                      ...selectedSecondaryLangs,
                      value,
                    ]);
                    updatePreferencesMutation.mutate({
                      programmingLanguage: {
                        primary:
                          userPreferences?.programmingLanguage?.primary ||
                          "javascript",
                        secondary: [...selectedSecondaryLangs, value],
                        frameworks:
                          userPreferences?.programmingLanguage?.frameworks ||
                          [],
                      },
                    });
                    refreshPreferences();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select secondary language" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMING_LANGUAGES.filter(
                    (lang) =>
                      lang !== userPreferences?.programmingLanguage?.primary &&
                      !selectedSecondaryLangs.includes(lang)
                  ).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💻</span>
                        <span>{lang}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Display selected secondary languages
              {selectedSecondaryLangs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSecondaryLangs.map((lang) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span className="text-sm">💻</span>
                      {lang}
                      <button
                        onClick={() => {
                          const newSecondary = selectedSecondaryLangs.filter(
                            (l) => l !== lang
                          );
                          setSelectedSecondaryLangs(newSecondary);
                          updatePreferencesMutation.mutate({
                            programmingLanguage: {
                              primary:
                                userPreferences?.programmingLanguage?.primary ||
                                "javascript",
                              secondary: newSecondary,
                              frameworks:
                                userPreferences?.programmingLanguage
                                  ?.frameworks || [],
                            },
                          });
                          refreshPreferences();
                        }}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Frameworks
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Frameworks & Libraries
              </label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !selectedFrameworks.includes(value)) {
                    setSelectedFrameworks([...selectedFrameworks, value]);
                    updatePreferencesMutation.mutate({
                      programmingLanguage: {
                        primary:
                          userPreferences?.programmingLanguage?.primary ||
                          "javascript",
                        secondary:
                          userPreferences?.programmingLanguage?.secondary || [],
                        frameworks: [...selectedFrameworks, value],
                      },
                    });
                    refreshPreferences();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select framework or library" />
                </SelectTrigger>
                <SelectContent>
                  {FRAMEWORKS.filter(
                    (framework) => !selectedFrameworks.includes(framework)
                  ).map((framework) => (
                    <SelectItem key={framework} value={framework}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span>{framework}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Display selected frameworks
              {selectedFrameworks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFrameworks.map((framework) => (
                    <Badge
                      key={framework}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span className="text-sm">⚡</span>
                      {framework}
                      <button
                        onClick={() => {
                          const newFrameworks = selectedFrameworks.filter(
                            (f) => f !== framework
                          );
                          setSelectedFrameworks(newFrameworks);
                          updatePreferencesMutation.mutate({
                            programmingLanguage: {
                              primary:
                                userPreferences?.programmingLanguage?.primary ||
                                "javascript",
                              secondary:
                                userPreferences?.programmingLanguage
                                  ?.secondary || [],
                              frameworks: newFrameworks,
                            },
                          });
                          refreshPreferences();
                        }}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Privacy & Data */}
      {/* <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Data
          </CardTitle>
          <CardDescription>
            Control how your data is collected and used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">
                  Help improve the app by sharing anonymous usage data
                </p>
              </div>
              <Switch
                checked={userPreferences?.consents?.analyticsEnabled || false}
                onCheckedChange={(checked) =>
                  handleConsentChange("analyticsEnabled", checked)
                }
                disabled={!authUser?.isSignedIn}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Error Reporting</p>
                <p className="text-xs text-muted-foreground">
                  Automatically report errors to help fix bugs
                </p>
              </div>
              <Switch
                checked={
                  userPreferences?.consents?.crashReportingEnabled || false
                }
                onCheckedChange={(checked) =>
                  handleConsentChange("crashReportingEnabled", checked)
                }
                disabled={!authUser?.isSignedIn}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Marketing</p>
                <p className="text-xs text-muted-foreground">
                  Receive updates about new features and improvements
                </p>
              </div>
              <Switch
                checked={userPreferences?.consents?.marketingOptIn || false}
                onCheckedChange={(checked) =>
                  handleConsentChange("marketingOptIn", checked)
                }
                disabled={!authUser?.isSignedIn}
              />
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* About & Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <NotebookIcon className="h-4 w-4" />
            About & Links
          </CardTitle>
          <CardDescription>
            Learn more about the app and get support. Read privacy policy and
            terms of service on our webapp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center justify-center">
            <div
              className="w-full justify-start p-2 rounded-full bg-primary/10 flex gap-2 items-center"
              onClick={() =>
                handleOpenExternalUrl("https://theme-your-code.com")
              }
            >
              <div className="p-2 rounded-full bg-primary/10">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
              Web App
            </div>

            <div
              className="w-full justify-start p-2 rounded-full bg-primary/10 flex gap-2 items-center"
              onClick={() =>
                handleOpenExternalUrl(
                  serverConfig?.githubUrl || "https://github.com"
                )
              }
            >
              <div className="p-2 rounded-full bg-primary/10">
                <Github className="h-4 w-4 text-primary" />
              </div>
              GitHub
            </div>

            <div
              className="w-full justify-start p-2 rounded-full bg-primary/10 flex gap-2 items-center"
              onClick={() =>
                handleOpenExternalUrl("https://github.com/your-repo/issues")
              }
            >
              <div className="p-2 rounded-full bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              Feedback
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Everything Section - Only show when logged in */}
      {authUser?.isSignedIn && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Settings
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
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Everything
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
