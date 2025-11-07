import { useQuery, useMutation } from "@/hooks/use-query";
import { useAuth } from "./auth-provider";
import { UserConsents } from "@shared/types/user";
import { log } from "../../../shared/src/utils/debug-logs";
import AuthSection from "./user-settings/auth";
import SyncSettings from "./user-settings/sync-settings";
import AboutLinks from "./user-settings/about-section";
import ResetSettings from "./user-settings/reset";
import SyncThemesCard from "./user-settings/sync";

export default function UserSettingsContent() {
  const { authUser } = useAuth();

  const { data: userPreferences, isLoading: isLoadingPreferences } = useQuery({
    command: "GET_USER_PREFERENCES",
    payload: null,
  });

  const { data: serverConfig } = useQuery({
    command: "GET_SERVER_CONFIG",
    payload: null,
  });

  const updatePreferencesMutation = useMutation("UPDATE_USER_PREFERENCES");

  const refreshPreferences = () => {
    window.location.reload();
  };

  const handleConsentChange = (
    consentType: keyof UserConsents,
    value: boolean
  ) => {
    const userPreferencesState = userPreferences
      ? userPreferences.consents
      : {
          dataSyncEnabled: false,
          readSettingsEnabled: false,
          analyticsEnabled: false,
          crashReportingEnabled: false,
          marketingOptIn: false,
          termsAccepted: false,
          privacyPolicyAccepted: false,
        };

    updatePreferencesMutation.mutate({
      consents: {
        ...userPreferencesState,
        [consentType]: value,
        lastUpdated: new Date().toISOString(),
      },
    });
    refreshPreferences();
  };

  const handleResetEverything = () => {
    log("Reset everything clicked");
  };

  if (isLoadingPreferences) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuthSection />
      {authUser?.isSignedIn ? <SyncThemesCard /> : null}
      <AboutLinks serverConfig={serverConfig} />
      {authUser?.isSignedIn && (
        <ResetSettings handleResetEverything={handleResetEverything} />
      )}
    </div>
  );
}
