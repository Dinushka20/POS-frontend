import React, { createContext, useContext, useState, useEffect } from "react";
import type { AuthResponse, LoginDto } from "../api/auth.api";
import { authApi } from "../api/auth.api";

interface AuthContextType {
  user: AuthResponse | null;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (dto: LoginDto) => {
    const response = await authApi.login(dto);
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response));
    setUser(response);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
