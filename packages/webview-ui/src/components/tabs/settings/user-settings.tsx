import AuthSection from "./sub-components/auth";
import AboutLinks from "./sub-components/about-section";
import ThemeManagement from "./sub-components/theme-management";

export default function UserSettingsContent() {
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
