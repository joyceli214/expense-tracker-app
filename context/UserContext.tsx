import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Group } from "@/dto/expense.dto";
import { getUserGroupsByUser } from "@/service/groups.service";

// Define user type
export interface User {
  email: string;
  name: string;
  _id: string;
}

// Create context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  userGroup: Group[];
  setUserGroup: (userGroup: Group[]) => void;
}

// Context provider component
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  userGroup: [],
  setUserGroup: () => {},
});
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userGroup, setUserGroup] = useState<Group[]>([]);

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem("user");
        const userGroupData = await AsyncStorage.getItem("userGroup");
        if (userGroupData) setUserGroup(JSON.parse(userGroupData));
        if (userData) setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to load data from storage:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Save user to storage when updated
  useEffect(() => {
    const saveUser = async () => {
      setLoading(true);
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
        console.log(user);
        const newUserGroup = await getUserGroupsByUser(user._id);
        setUserGroup(newUserGroup);
        await AsyncStorage.setItem("userGroup", JSON.stringify(newUserGroup));
      } else {
        await AsyncStorage.removeItem("user");
      }
      setLoading(false);
    };
    saveUser();
  }, [user]);
  return (
    <UserContext.Provider
      value={{ user, setUser, loading, userGroup, setUserGroup }}
    >
      {children}
    </UserContext.Provider>
  );
};
