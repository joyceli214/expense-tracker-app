import {
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ListRenderItem,
  FlatList,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { Group } from "@/dto/expense.dto";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { userGroup } = useContext(UserContext);
  const router = useRouter();

  const renderItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({ pathname: "/expenses", params: { id: item._id } })
      }
      key={item._id}
    >
      <ThemedText>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Groups</ThemedText>
      </ThemedView>
      {userGroup.map((item) => renderItem({ item }))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  item: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
});
