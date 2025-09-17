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
  Settings,
  RotateCcw,
  LogIn,
  LogOut,
  User,
  X,
  Code,
  Shield,
  ExternalLink,
  Check,
  NotebookIcon,
  MessageSquare,
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
import { SignInButton } from "@clerk/clerk-react";
import { log } from "../../lib/debug-logs";
import FeedbackDialog from "./feedback-dialog";

interface UserSettingsProps {
  className?: string;
}

export default function UserSettings({ className }: UserSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [selectedSecondaryLangs, setSelectedSecondaryLangs] = useState<
    string[]
  >([]);

  // Use Clerk authentication
  //   const {
  //     authUser,
  //     isLoading: isAuthLoading,
  //     signIn,
  //     signOut,
  //   } = useAuth();

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
    const currentConsents = userPreferences?.consents || {
      dataSyncEnabled: false,
      readSettingsEnabled: false,
      analyticsEnabled: false,
      crashReportingEnabled: false,
      marketingOptIn: false,
      termsAccepted: false,
      privacyPolicyAccepted: false,
      lastUpdated: new Date().toISOString(),
    };

    updatePreferencesMutation.mutate({
      consents: {
        ...currentConsents,
        [consentType]: value,
        lastUpdated: new Date().toISOString(),
      },
    });
    refreshPreferences();
  };

  const addFramework = (framework: string) => {
    if (!selectedFrameworks.includes(framework)) {
      const newFrameworks = [...selectedFrameworks, framework];
      setSelectedFrameworks(newFrameworks);
      updatePreferencesMutation.mutate({
        programmingLanguage: {
          primary: userPreferences?.programmingLanguage?.primary || "",
          secondary: userPreferences?.programmingLanguage?.secondary || [],
          frameworks: newFrameworks,
        },
      });
      refreshPreferences();
    }
  };

  const removeFramework = (framework: string) => {
    const newFrameworks = selectedFrameworks.filter((f) => f !== framework);
    setSelectedFrameworks(newFrameworks);
    updatePreferencesMutation.mutate({
      programmingLanguage: {
        primary: userPreferences?.programmingLanguage?.primary || "",
        secondary: userPreferences?.programmingLanguage?.secondary || [],
        frameworks: newFrameworks,
      },
    });
    refreshPreferences();
  };

  const addSecondaryLanguage = (language: string) => {
    if (
      !selectedSecondaryLangs.includes(language) &&
      language !== userPreferences?.programmingLanguage?.primary
    ) {
      const newSecondary = [...selectedSecondaryLangs, language];
      setSelectedSecondaryLangs(newSecondary);
      updatePreferencesMutation.mutate({
        programmingLanguage: {
          primary: userPreferences?.programmingLanguage?.primary || "",
          secondary: newSecondary,
          frameworks: userPreferences?.programmingLanguage?.frameworks || [],
        },
      });
      refreshPreferences();
    }
  };

  const removeSecondaryLanguage = (language: string) => {
    const newSecondary = selectedSecondaryLangs.filter((l) => l !== language);
    setSelectedSecondaryLangs(newSecondary);
    updatePreferencesMutation.mutate({
      programmingLanguage: {
        primary: userPreferences?.programmingLanguage?.primary || "",
        secondary: newSecondary,
        frameworks: userPreferences?.programmingLanguage?.frameworks || [],
      },
    });
    refreshPreferences();
  };

  //   const handleLoginLogout = async () => {
  //     try {
  //       if (authUser?.isSignedIn) {
  //         await signOut();
  //       } else {
  //         await signIn();
  //       }
  //     } catch (error) {
  //       console.error("Auth error:", error);
  //     }
  //   };

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Gear Icon */}
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-primary/10"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          style={{ opacity: isOpen ? 1 : 0 }}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: "50%",
          minWidth: "400px",
          maxWidth: "600px",
        }}
      >
        {/* Header */}
        <div className="border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className=" font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              User Settings
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your account and application preferences
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Login/Logout Section */}
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
            {/* <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  {authUser?.isSignedIn ? (
                    <div className="flex items-center gap-3">
                      {authUser.imageUrl && (
                        <img
                          src={authUser.imageUrl}
                          alt="Profile"
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {authUser.firstName && authUser.lastName
                            ? `${authUser.firstName} ${authUser.lastName}`
                            : authUser.username || authUser.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {authUser.email}
                          {authUser.githubUsername && (
                            <span className="ml-2">
                              • GitHub: @{authUser.githubUsername}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">Not signed in</p>
                      <p className="text-xs text-muted-foreground">
                        Sign in with GitHub to sync your themes and settings
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleLoginLogout}
                  variant={authUser?.isSignedIn ? "outline" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    "Loading..."
                  ) : authUser?.isSignedIn ? (
                    <>
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In with GitHub
                    </>
                  )}
                </Button>
                <SignInButton />
              </div>
            </CardContent> */}
          </Card>

          {/* Programming Language Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Programming Languages
              </CardTitle>
              <CardDescription>
                Select your primary and secondary programming languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Language</label>
                <Select
                  value={userPreferences?.programmingLanguage?.primary || ""}
                  onValueChange={handlePrimaryLanguageChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary language" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMMING_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Secondary Languages */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Secondary Languages
                </label>
                <Select onValueChange={addSecondaryLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add secondary languages" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMMING_LANGUAGES.filter(
                      (lang) =>
                        lang !==
                          userPreferences?.programmingLanguage?.primary &&
                        !selectedSecondaryLangs.includes(lang)
                    ).map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSecondaryLangs.map((lang) => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSecondaryLanguage(lang)}
                    >
                      {lang} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Frameworks */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Frameworks & Libraries
                </label>
                <Select onValueChange={addFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add frameworks you use" />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAMEWORKS.filter(
                      (framework) => !selectedFrameworks.includes(framework)
                    ).map((framework) => (
                      <SelectItem key={framework} value={framework}>
                        {framework}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFrameworks.map((framework) => (
                    <Badge
                      key={framework}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => removeFramework(framework)}
                    >
                      {framework} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consent Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy & Consent
              </CardTitle>
              <CardDescription>
                Manage your data sharing and privacy preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Sync */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Data Synchronization</p>
                  <p className="text-xs text-muted-foreground">
                    Sync your preferences across devices
                  </p>
                </div>
                <Switch
                  checked={userPreferences?.consents?.dataSyncEnabled || false}
                  onCheckedChange={(value) =>
                    handleConsentChange("dataSyncEnabled", value)
                  }
                />
              </div>

              {/* Read Settings */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Read VS Code Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Allow reading your VS Code configuration
                  </p>
                </div>
                <Switch
                  checked={
                    userPreferences?.consents?.readSettingsEnabled || false
                  }
                  onCheckedChange={(value) =>
                    handleConsentChange("readSettingsEnabled", value)
                  }
                />
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Usage Analytics</p>
                  <p className="text-xs text-muted-foreground">
                    Help improve the extension with anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={userPreferences?.consents?.analyticsEnabled || false}
                  onCheckedChange={(value) =>
                    handleConsentChange("analyticsEnabled", value)
                  }
                />
              </div>

              {/* Crash Reporting */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Crash Reporting</p>
                  <p className="text-xs text-muted-foreground">
                    Send crash reports to help us fix issues
                  </p>
                </div>
                <Switch
                  checked={
                    userPreferences?.consents?.crashReportingEnabled || false
                  }
                  onCheckedChange={(value) =>
                    handleConsentChange("crashReportingEnabled", value)
                  }
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Marketing Communications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive updates about new features and tips
                  </p>
                </div>
                <Switch
                  checked={userPreferences?.consents?.marketingOptIn || false}
                  onCheckedChange={(value) =>
                    handleConsentChange("marketingOptIn", value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Data Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Your data is encrypted and stored securely. We follow industry
                  best practices to protect your privacy.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• All personal data is encrypted using AES-256 encryption</p>
                <p>• Data is only stored with your explicit consent</p>
                <p>• You can revoke consent and delete your data at any time</p>
                <p>• Our servers use enterprise-grade security measures</p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {serverConfig && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 justify-start"
                      onClick={() => {
                        if (serverConfig?.githubUrl) {
                          openExternalUrlMutation.mutate({
                            url: serverConfig.githubUrl,
                          });
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Server Source Code
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 justify-start"
                      onClick={() => {
                        if (serverConfig?.privacyPolicyUrl) {
                          openExternalUrlMutation.mutate({
                            url: serverConfig.privacyPolicyUrl,
                          });
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Privacy Policy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 justify-start"
                      onClick={() => {
                        if (serverConfig?.termsOfServiceUrl) {
                          openExternalUrlMutation.mutate({
                            url: serverConfig.termsOfServiceUrl,
                          });
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Terms of Service
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </CardTitle>
              <CardDescription>
                Provide feedback or report an issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackDialog />
            </CardContent>
          </Card>

          {/* Reset Everything Section */}
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
        </div>
      </div>
    </>
  );
}
