import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { UserContext } from "@/context/UserContext";
import { getExpensesSum } from "@/service/expenses.service";
import { useFocusEffect } from "@react-navigation/native";
import React, { createElement, useCallback, useContext, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "react-native-ui-datepicker";
import dayjs, { Dayjs } from "dayjs";

function WebDateTimePicker({ value, onChange }: any) {
  return createElement("input", {
    type: "date",
    value: value.format("YYYY-MM-DD"),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(dayjs(e.target.value)),
  });
}

interface ExpenseItem {
  category: string;
  amount: number;
  percentage: string;
}

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [from, setFrom] = useState<Dayjs>(
    dayjs(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );
  const [to, setTo] = useState<Dayjs>(
    dayjs(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
  );
  const [editDate, setEditDate] = useState<"from" | "to">("from");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"from" | "to">("from");
  const { user } = useContext(UserContext);
  const loadExpenses = useCallback(async () => {
    try {
      const data = await getExpensesSum(user!._id, from.toDate(), to.toDate());
      if (data) {
        const totalExpenses = data.total;
        setTotal(totalExpenses);
        const expenseItems: ExpenseItem[] = Object.entries(data)
          .filter(([key]) => key !== "total")
          .map(([category, amount]) => {
            const percentage = (
              ((amount as number) / totalExpenses) *
              100
            ).toFixed(2);
            return {
              category: category,
              amount: amount as number,
              percentage: `${percentage}%`,
            };
          });
        setExpenses(expenseItems);
      }
    } catch (error) {
      console.error("Failed to load expenses:", error);
    }
  }, [from, to, user]);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: ExpenseItem;
    index: number;
  }) => (
    <ThemedView style={styles.item} key={index}>
      <ThemedText style={styles.percentage}>{item.percentage}</ThemedText>
      <ThemedText style={styles.category}>{item.category}</ThemedText>
      <ThemedText style={styles.amount}>${item.amount.toFixed(2)}</ThemedText>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chart.bar"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Statistics</ThemedText>
      </ThemedView>
      <ThemedText>Total: ${total.toFixed(2)}</ThemedText>

      <ThemedView style={styles.datePickerContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setShowDatePicker(!showDatePicker);
            setEditDate("from");
          }}
        >
          <ThemedText>
            {from.format("MMM DD, YYYY")} - {to.format("MMM DD, YYYY")}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      {showDatePicker &&
        (Platform.OS === "web" ? (
          <ThemedView>
            <ThemedView style={styles.webDatePickerContainer}>
              <ThemedView style={styles.webDatePickerItem}>
                <ThemedText style={styles.dateLabel}>From:</ThemedText>
                <WebDateTimePicker
                  value={from}
                  onChange={(date: Dayjs) => {
                    setFrom(date);
                    loadExpenses();
                  }}
                />
              </ThemedView>
              <ThemedView style={styles.webDatePickerItem}>
                <ThemedText style={styles.dateLabel}>To:</ThemedText>
                <WebDateTimePicker
                  value={to}
                  onChange={(date: Dayjs) => {
                    setTo(date);
                    loadExpenses();
                  }}
                />
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowDatePicker(false)}
              >
                <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        ) : (
          <ThemedView>
            <DateTimePicker
              mode="range"
              startDate={from}
              endDate={to}
              onChange={({ startDate, endDate }) => {
                if (editDate === "from") {
                  if (dayjs(startDate).isBefore(to)) {
                    setFrom(startDate as Dayjs);
                  } else {
                    setFrom(to);
                    setTo(startDate as Dayjs);
                  }
                  setEditDate("to");
                } else {
                  if (dayjs(startDate).isAfter(from)) {
                    setTo(startDate as Dayjs);
                  } else {
                    setFrom(startDate as Dayjs);
                    setTo(from);
                  }
                  setEditDate("from");
                  // Close date picker and reload expenses after both dates are set
                  setShowDatePicker(false);
                  loadExpenses();
                }
              }}
            />
            <ThemedView style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowDatePicker(false)}
              >
                <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        ))}

      {expenses.map((item, index) => renderItem({ item, index }))}
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  item: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  percentage: { flex: 1, fontSize: 14, color: "#666" },
  category: { flex: 2, fontSize: 16 },
  amount: { flex: 1, textAlign: "right", fontSize: 16, fontWeight: "bold" },
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  webDatePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
    flexWrap: "wrap",
  },
  webDatePickerItem: {
    marginHorizontal: 10,
    marginVertical: 5,
    alignItems: "center",
  },
  dateLabel: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ExpensesPage;
