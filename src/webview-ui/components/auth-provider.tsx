"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "../hooks/use-query";
import { AuthUser, AuthSession } from "../../types/user-preferences";

interface AuthContextType {
  authUser: AuthUser | null;
  authSession: AuthSession | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
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

  const signInMutation = useMutation("WEBAPP_SIGN_IN");
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
    if (backendSession) {
      setAuthSession(backendSession);
    } else {
      setAuthSession(null);
    }
  }, [backendSession]);

  useEffect(() => {
    setIsLoading(false);
  }, [backendUser, backendSession]);

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
      setAuthSession(null);
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
    authSession,
    isLoading,
    signIn,
    signOut,
    refreshAuth,
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
