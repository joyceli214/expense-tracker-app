import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { UserContext } from "@/context/UserContext";
import { ExpenseDto, User } from "@/dto/expense.dto";
import { getExpensesByGroupIds } from "@/service/expenses.service";
import { format } from "date-fns";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, userGroup } = useContext(UserContext);
  const { id } = useLocalSearchParams();
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const fetchExpenses = async () => {
        try {
          const expenses = await getExpensesByGroupIds(
            id ? [id as string] : userGroup.map((group) => group._id)
          );
          setExpenses(expenses);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchExpenses();
    }, [id])
  );

  if (loading) {
    // return <ThemedText>Loading...</ThemedText>;
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ActivityIndicator size="large" />
    </ThemedView>;
  }

  if (error) {
    return <ThemedText>Error loading expenses: {error.message}</ThemedText>;
  }

  function calculateDebtsFromUserPerspective(
    expenses: ExpenseDto[],
    currentUserId: string
  ): string[] {
    const balances: Record<string, number> = {};

    // Step 1: Calculate net balance for each user
    expenses.forEach(({ paidBy, expense }) => {
      const payerId = paidBy._id;
      if (payerId === currentUserId) {
        expense.forEach(({ user, amount }) => {
          const userId = user;
          if (userId === currentUserId) return;
          balances[userId] = (balances[userId] || 0) - amount;
        });
        return;
      } else {
        balances[payerId] =
          (balances[payerId] || 0) +
          (expense.find((e) => e.user === currentUserId)?.amount || 0);
      }
    });

    // Step 2: Generate readable output for the current user
    const result: string[] = [];

    Object.entries(balances).forEach(([userId, balance]) => {
      if (userId === currentUserId) return;

      const userName = userGroup
        .find((group) => group._id === id)
        ?.members.find((member) => member._id === userId)?.name;

      if (balance < 0) {
        result.push(`${userName} owes you $${(-balance).toFixed(2)}`);
      } else if (balance > 0) {
        result.push(`You owe ${userName} $${balance.toFixed(2)}`);
      }
    });

    return result.length ? result : ["All debts are settled."];
  }

  const renderItem = ({ item, index }: { item: ExpenseDto; index: number }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({ pathname: "/addExpense", params: { id: item._id } })
      }
      key={index}
    >
      <ThemedText style={styles.date}>{format(item.date, "MMM dd")}</ThemedText>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
      <ThemedText style={styles.amount}>
        ${item.expense.reduce((sum, expense) => sum + expense.amount, 0)}
      </ThemedText>
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
        <ThemedText type="title">
          {id ? userGroup.find((group) => group._id === id)?.name : "Expenses"}
        </ThemedText>
      </ThemedView>
      <ThemedText>
        {id &&
          userGroup.find((group) => group._id === id)!.members.length > 1 &&
          calculateDebtsFromUserPerspective(expenses, user!._id)}
      </ThemedText>

      <ThemedView style={styles.deleteButtonContainer}>
        <Button
          title="Add Expense"
          onPress={() =>
            router.push({
              pathname: "/addExpense",
              params: { id: null, groupId: id },
            })
          }
        />
      </ThemedView>

      {expenses.map((item, index) => renderItem({ item, index }))}
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
  deleteButtonContainer: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
});
