import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define user type
export interface User {
  email: string;
  name: string;
  id: string;
}

// Create context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

// Context provider component
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Save user to storage when updated
  useEffect(() => {
    const saveUser = async () => {
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem("user");
      }
    };
    saveUser();
  }, [user]);
  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
