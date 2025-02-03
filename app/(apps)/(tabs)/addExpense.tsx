import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ExpenseDto, NewExpenseDto } from "@/dto/expense.dto";
import { getExpensesById as getExpenseById } from "@/service/api";
import { format } from "date-fns";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

export default function AddEditExpenseScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [expense, setExpense] = useState<NewExpenseDto>({
    date: new Date(),
    description: "",
    amount: 0,
    type: "test",
    paidBy: "test",
  });
  const [error, setError] = useState(null);
  useEffect(() => {
    if (id) {
      const fetchExpense = async () => {
        const details = await getExpenseById(id as string);
        if (details) setExpense(details);
      };
      fetchExpense();
    }
  }, []);
  const handleSubmit = async () => {
    // try {
    //   if (route.params?.item) {
    //     await updateExpense(expense);
    //   } else {
    //     await addExpense(expense);
    //   }
    //   navigation.goBack();
    // } catch (err) {
    //   setError(err.message);
    // }
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <TextInput
        style={styles.input}
        value={format(expense.date, "yyyy-MM-dd")}
        onChangeText={(date) =>
          setExpense({ ...expense, date: new Date(date) })
        }
        placeholder="Date (yyyy-MM-dd)"
      />
      <TextInput
        style={styles.input}
        value={expense.description}
        onChangeText={(description) => setExpense({ ...expense, description })}
        placeholder="Description"
      />
      <TextInput
        style={styles.input}
        value={expense.amount.toString()}
        onChangeText={(amount) =>
          setExpense({ ...expense, amount: parseFloat(amount) })
        }
        placeholder="Amount"
        keyboardType="numeric"
      />
      {error && <View style={styles.error}>{error}</View>}
      <Button title="Save" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
});
