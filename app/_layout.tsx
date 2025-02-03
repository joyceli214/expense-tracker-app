import { Slot } from "expo-router";
import "react-native-reanimated";

import { UserProvider } from "@/context/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <Slot />
    </UserProvider>
  );
}
