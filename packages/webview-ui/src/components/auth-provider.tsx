// "use client";

// Import {
//   CreateContext,
//   UseContext,
//   UseState,
//   UseEffect,
//   ReactNode,
// } from "react";
// Import { useQuery, useMutation } from "../hooks/use-query";
// Import { AuthUser } from "@shared/types/user";
// Import useToast from "../hooks/use-toast";

// Interface AuthContextType {
//   AuthUser: AuthUser | null;
//   IsLoading: boolean;
//   SignIn: () => Promise<void>;
//   SignOut: () => Promise<void>;
//   RefreshAuth: () => void;
//   DeviceFlow: DeviceFlow;
// }

// Const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Interface AuthProviderProps {
//   Children: ReactNode;
// }
// Export type DeviceFlow = {
//   User_code: string;
//   VerificationUri: string;
//   ExpiresIn: number;
// } | null;
// Export function AuthProvider({ children }: AuthProviderProps) {
//   Const toast = useToast();
//   Const [authUser, setAuthUser] = useState<AuthUser | null>(null);
//   Const [isLoading, setIsLoading] = useState(true);
//   Const [deviceFlow, setDeviceFlow] = useState<DeviceFlow>(null);

//   // VS Code extension backend communication
//   Const { data: backendUser } = useQuery({
//     Command: "GET_AUTH_USER",
//     Payload: null,
//   });

//   Const signInMutation = useMutation("WEBAPP_SIGN_IN", {
//     OnSuccess: (data) => {
//       If (!data) throw new Error("Failed to sign in");
//       If (!data.user_code || !data.verificationUri || !data.expiresIn)
//         Throw new Error("Failed to sign in");
//       SetDeviceFlow({
//         User_code: data.user_code,
//         VerificationUri: data.verificationUri,
//         ExpiresIn: data.expiresIn,
//       });
//     },
//     OnError: (error) => {
//       Toast({
//         Message: "Failed to sign in",
//         Type: "error",
//       });
//     },
//   });
//   Const signOutMutation = useMutation("SIGN_OUT");
//   Const updateUserMutation = useMutation("UPDATE_AUTH_USER");

//   // Sync with backend auth state
//   UseEffect(() => {
//     If (backendUser) {
//       SetAuthUser(backendUser);
//     } else {
//       SetAuthUser(null);
//     }
//   }, [backendUser]);

//   UseEffect(() => {
//     SetIsLoading(false);
//   }, [backendUser]);

//   Const signIn = async () => {
//     Try {
//       Await signInMutation.mutate(null);
//     } catch (error) {
//       Console.error("Sign in failed:", error);
//       Throw error;
//     }
//   };

//   Const signOut = async () => {
//     Try {
//       Await signOutMutation.mutate(null);
//       SetAuthUser(null);
//     } catch (error) {
//       Console.error("Sign out failed:", error);
//       Throw error;
//     }
//   };

//   Const refreshAuth = () => {
//     // Trigger a refresh of auth state from backend
//     Window.location.reload();
//   };

//   Const value: AuthContextType = {
//     AuthUser,
//     IsLoading,
//     SignIn,
//     SignOut,
//     RefreshAuth,
//     DeviceFlow,
//   };

//   Return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// Export function useAuth() {
//   Const context = useContext(AuthContext);
//   If (context === undefined) {
//     Throw new Error("useAuth must be used within an AuthProvider");
//   }
//   Return context;
// }
