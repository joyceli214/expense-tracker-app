import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ExpenseDto } from "@/dto/expense.dto";
import { getExpenses } from "@/service/api";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expenses = await getExpenses();
        setExpenses(expenses);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <ThemedText>Error loading expenses: {error.message}</ThemedText>;
  }

  const renderItem: ListRenderItem<ExpenseDto> = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({ pathname: "/addExpense", params: { id: item._id } })
      }
    >
      <ThemedText style={styles.date}>{format(item.date, "MMM dd")}</ThemedText>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
      <ThemedText style={styles.amount}>${item.amount}</ThemedText>
    </TouchableOpacity>
  );
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  date: { flex: 1, fontSize: 14, color: "#666" },
  description: { flex: 2, fontSize: 16 },
  amount: { flex: 1, textAlign: "right", fontSize: 16, fontWeight: "bold" },
});
