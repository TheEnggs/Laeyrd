import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { useQuery, useMutation } from "../hooks/use-query";
import {
  AuthUser,
  AuthSession,
  ServerConfig,
} from "../../types/user-preferences";

interface ClerkAuthContextType {
  authUser: AuthUser | null;
  authSession: AuthSession | null;
  isLoading: boolean;
  signIn: (returnUrl?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => void;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(
  undefined
);

interface ClerkAuthProviderProps {
  children: ReactNode;
}

// Inner component that uses Clerk hooks
function ClerkAuthWrapper({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut: clerkSignOut } = useAuth();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // VS Code extension backend communication
  const { data: backendUser } = useQuery({
    command: "GET_AUTH_USER",
    payload: null,
  });

  const { data: backendSession } = useQuery({
    command: "GET_AUTH_SESSION",
    payload: null,
  });

  const signInMutation = useMutation("CLERK_SIGN_IN");
  const signOutMutation = useMutation("CLERK_SIGN_OUT");
  const updateUserMutation = useMutation("UPDATE_AUTH_USER");

  // Sync Clerk user with backend
  useEffect(() => {
    if (isLoaded && isSignedIn && user && !authUser) {
      const mappedUser: AuthUser = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        imageUrl: user.imageUrl,
        username: user.username || undefined,
        githubUsername:
          user.externalAccounts?.find(
            (account) => account.provider === "github"
          )?.username || undefined,
        isSignedIn: true,
        lastSignInAt: user.lastSignInAt?.toISOString(),
        createdAt: user.createdAt?.toISOString(),
      };

      // Update backend with Clerk user data
      updateUserMutation.mutate(mappedUser);
      setAuthUser(mappedUser);
    } else if (isLoaded && !isSignedIn) {
      setAuthUser(null);
      setAuthSession(null);
    }

    setIsLoading(!isLoaded);
  }, [isLoaded, isSignedIn, user, authUser, updateUserMutation]);

  // Sync with backend auth state
  useEffect(() => {
    if (backendUser) {
      setAuthUser(backendUser);
    }
    if (backendSession) {
      setAuthSession(backendSession);
    }
  }, [backendUser, backendSession]);

  const signIn = async (returnUrl?: string) => {
    try {
      signInMutation.mutate({ returnUrl });
      console.log("Sign-in initiated");
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Clerk
      await clerkSignOut();

      // Sign out from backend
      signOutMutation.mutate(null);
      setAuthUser(null);
      setAuthSession(null);
      console.log("Sign-out successful");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const refreshAuth = () => {
    // Force re-render to refresh auth state
    window.location.reload();
  };

  return (
    <ClerkAuthContext.Provider
      value={{
        authUser,
        authSession,
        isLoading,
        signIn,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </ClerkAuthContext.Provider>
  );
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  const { data: serverConfig } = useQuery({
    command: "GET_SERVER_CONFIG",
    payload: null,
  });

  if (!serverConfig?.clerkPublishableKey) {
    console.warn("Clerk publishable key not available");
    return (
      <ClerkAuthContext.Provider
        value={{
          authUser: null,
          authSession: null,
          isLoading: false,
          signIn: async () => {},
          signOut: async () => {},
          refreshAuth: () => {},
        }}
      >
        {children}
      </ClerkAuthContext.Provider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={serverConfig.clerkPublishableKey}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "hsl(var(--primary))",
          colorBackground: "hsl(var(--background))",
          colorInputBackground: "hsl(var(--background))",
          colorText: "hsl(var(--foreground))",
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            "&:hover": {
              backgroundColor: "hsl(var(--primary))",
              opacity: 0.9,
            },
          },
          card: {
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          },
          headerTitle: {
            color: "hsl(var(--foreground))",
          },
          headerSubtitle: {
            color: "hsl(var(--muted-foreground))",
          },
        },
      }}
    >
      <ClerkAuthWrapper>{children}</ClerkAuthWrapper>
    </ClerkProvider>
  );
}

export function useClerkAuth() {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error("useClerkAuth must be used within a ClerkAuthProvider");
  }
  return context;
}
