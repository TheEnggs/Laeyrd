import AuthSection from "./sub-components/auth";
import AboutLinks from "./sub-components/about-section";
import ThemeManagement from "./sub-components/theme-management";

export default function UserSettingsContent() {
  //   const { authUser } = useAuth();

  //   const { data: userPreferences, isLoading: isLoadingPreferences } = useQuery({
  //     command: "GET_USER_PREFERENCES",
  //     payload: null,
  //   });

  //   const updatePreferencesMutation = useMutation("UPDATE_USER_PREFERENCES");

  //   const refreshPreferences = () => {
  //     window.location.reload();
  //   };

  //   const handleConsentChange = (
  //     consentType: keyof UserConsents,
  //     value: boolean
  //   ) => {
  //     const userPreferencesState = userPreferences
  //       ? userPreferences.consents
  //       : {
  //           dataSyncEnabled: false,
  //           readSettingsEnabled: false,
  //           analyticsEnabled: false,
  //           crashReportingEnabled: false,
  //           marketingOptIn: false,
  //           termsAccepted: false,
  //           privacyPolicyAccepted: false,
  //         };

  //     updatePreferencesMutation.mutate({
  //       consents: {
  //         ...userPreferencesState,
  //         [consentType]: value,
  //         lastUpdated: new Date().toISOString(),
  //       },
  //     });
  //     refreshPreferences();
  //   };

  //   const handleResetEverything = () => {
  //     ;
  //   };

  //   if (isLoadingPreferences) {
  //     return (
  //       <div className="flex items-center justify-center p-8">
  //         <div className="text-muted-foreground">Loading preferences...</div>
  //       </div>
  //     );
  //   }

  return (
    <div className="space-y-6">
      <ThemeManagement />
      <AuthSection />
      {/* {authUser?.isSignedIn ? <SyncThemesCard /> : null} */}
      <AboutLinks />
      {/* {authUser?.isSignedIn && (
        <ResetSettings handleResetEverything={handleResetEverything} />
      )} */}
    </div>
  );
}
