import { createContext, useContext, useEffect, useState } from "react";
import Login from "./Login";

interface User {
  username: string;
}

interface AuthContextType {
  user: User;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Retrieves data about the current user
  async function fetchUserData() {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const me = await response.json();
        setUser(me);
      }
    } finally {
      setLoading(false);
    }
  }

  // Called when unauthorized user successfully logs in
  function onLoginSuccess() {
    window.location.reload();
  }
  // Logout function
  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Logout failed:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      window.location.href = "/";
    }
  }

  // Called once on page load
  useEffect(() => {
    fetchUserData().catch(console.error);
  }, []);

  return loading ? (
    // While fetching user data
    ""
  ) : user === null ? (
    // User is unauthorized, show login form
    <Login onLoginSuccess={onLoginSuccess} />
  ) : (
    // User authorized successfully, show app content
    <AuthContext.Provider value={{ user: user, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
