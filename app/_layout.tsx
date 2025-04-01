import { Slot } from "expo-router";
import "react-native-reanimated";

import { UserProvider } from "@/context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  // AsyncStorage.clear();
  return (
    <UserProvider>
      <Slot />
    </UserProvider>
  );
}
