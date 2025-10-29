"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "../hooks/use-query";
import { AuthUser } from "@src/types/user-preferences";
import useToast from "../hooks/use-toast";

interface AuthContextType {
  authUser: AuthUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => void;
  deviceFlow: DeviceFlow;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}
export type DeviceFlow = {
  user_code: string;
  verificationUri: string;
  expiresIn: number;
} | null;
export function AuthProvider({ children }: AuthProviderProps) {
  const toast = useToast();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceFlow, setDeviceFlow] = useState<DeviceFlow>(null);

  // VS Code extension backend communication
  const { data: backendUser } = useQuery({
    command: "GET_AUTH_USER",
    payload: null,
  });

  const signInMutation = useMutation("WEBAPP_SIGN_IN", {
    onSuccess: (data) => {
      if (!data) throw new Error("Failed to sign in");
      if (!data.user_code || !data.verificationUri || !data.expiresIn)
        throw new Error("Failed to sign in");
      setDeviceFlow({
        user_code: data.user_code,
        verificationUri: data.verificationUri,
        expiresIn: data.expiresIn,
      });
    },
    onError: (error) => {
      toast({
        message: "Failed to sign in",
        type: "error",
      });
    },
  });
  const signOutMutation = useMutation("SIGN_OUT");
  const updateUserMutation = useMutation("UPDATE_AUTH_USER");

  // Sync with backend auth state
  useEffect(() => {
    if (backendUser) {
      setAuthUser(backendUser);
    } else {
      setAuthUser(null);
    }
  }, [backendUser]);

  useEffect(() => {
    setIsLoading(false);
  }, [backendUser]);

  const signIn = async () => {
    try {
      await signInMutation.mutate(null);
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutMutation.mutate(null);
      setAuthUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  const refreshAuth = () => {
    // Trigger a refresh of auth state from backend
    window.location.reload();
  };

  const value: AuthContextType = {
    authUser,
    isLoading,
    signIn,
    signOut,
    refreshAuth,
    deviceFlow,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
