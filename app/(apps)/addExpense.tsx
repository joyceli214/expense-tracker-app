import { ThemedText } from "@/components/ThemedText";
import { Group } from "@/dto/expense.dto";

import alert from "@/components/Alert";
import { ThemedScrollView } from "@/components/ThemedScrollView";
import { UserContext } from "@/context/UserContext";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  updateExpense,
} from "@/service/expenses.service";
import dayjs from "dayjs";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import {
  createElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  StyleProp,
  StyleSheet,
  Switch,
  TextInput,
  ViewStyle,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "react-native-ui-datepicker";

function WebDateTimePicker({ value, onChange }: any) {
  return createElement("input", {
    type: "date",
    value: value,
    onChange: (event: any) => {
      try {
        // Extract the date string from the event
        const dateString = event.target.value;

        // Create a date object from the string
        const dateObject = new Date(dateString);

        // Check if the date is valid
        if (!isNaN(dateObject.getTime())) {
          onChange(dateObject);
        } else {
          console.error("Invalid date format:", dateString);
        }
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    },
  });
}
interface Expense {
  amount?: number;
  description?: string;
  date?: Date;
  category?: string;
  paidBy?: string;
  splitEqually?: boolean;
  group?: Group;
}
export default function AddEditExpenseScreen() {
  const navigation = useNavigation();
  const { id, groupId } = useLocalSearchParams();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [error, setError] = useState(null);
  const { user, userGroup } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const fetchExpense = async () => {
        const details = await getExpenseById(id as string);
        if (details)
          setExpense({
            amount: details.expense.reduce(
              (sum, expense) => sum + expense.amount,
              0
            ),
            description: details.description,
            date: new Date(details.date),
            category: details.category,
            paidBy: details.paidBy._id,
            splitEqually:
              details.expense.length > 1 &&
              details.expense.every(
                (v) => v.amount === details.expense[0].amount
              ),
            group: userGroup.find((group) => group._id === details.group),
          });
      };
      console.log("id:" + id);
      setLoading(true);
      if (id) {
        fetchExpense();
      } else {
        setExpense(() => ({
          amount: undefined,
          description: "",
          category: "Food",
          paidBy: userGroup.find((group) => group._id === groupId)?.members[0]
            ._id,
          date: new Date(),
          group: userGroup.find((group) => group._id === groupId),
          splitEqually: true,
        }));
      }
      setLoading(false);
    }, [id, groupId])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: id ? "Update Expense" : "Create Expense",
      headerRight: () =>
        id && <Button title="Delete" onPress={handleDelete} color="red" />,
    });
  }, [navigation]);

  const [paidByOptions, setPaidByOptions] = useState<any[]>([]);

  // Update paidByOptions when expense.group changes
  useEffect(() => {
    if (expense?.group) {
      const group = userGroup.find((group) => group._id === expense.group?._id);
      if (group) {
        setPaidByOptions(
          group.members.map((user) => ({
            label: user.name,
            value: user._id,
          }))
        );
        handleChange("paidBy", group.members[0]._id);
      }
    }
  }, [expense?.group]);

  const handleChange = (key: keyof Expense, value: any) => {
    setExpense((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    console.log(JSON.stringify(expense));
    const missingFields = [];

    if (!expense?.amount) missingFields.push("Amount");
    if (!expense?.description) missingFields.push("Description");
    if (!expense?.category) missingFields.push("Category");
    if (!expense?.paidBy) missingFields.push("Paid By");
    if (!expense?.date) missingFields.push("Date");
    if (expense?.group === undefined || expense?.group === null)
      missingFields.push("Group");

    if (missingFields.length > 0) {
      alert(
        "Error",
        `Please fill in the following fields: ${missingFields.join(", ")}`
      );
      return;
    }
    if (
      !expense ||
      !expense.amount ||
      !expense.description ||
      !expense.category ||
      !expense.paidBy ||
      !expense.date ||
      !expense.group
    ) {
      alert("Error", "Unexpected error: Some data is missing after loading.");
      return;
    }

    // calculate expense distribution
    let expenseDistribution;
    if (expense.group.members.length === 1) {
      expenseDistribution = [{ user: user!._id, amount: expense.amount }];
    } else {
      if (expense.splitEqually) {
        expenseDistribution = expense.group.members.map((user) => ({
          user: user._id,
          amount: expense.amount! / 2,
        }));
      } else {
        expenseDistribution = [
          {
            user: expense.group.members.find(
              (user) => user._id !== expense.paidBy
            )!._id,
            amount: expense.amount,
          },
        ];
      }
    }
    if (id) {
      await updateExpense(id as string, {
        description: expense.description,
        date: expense.date,
        category: expense.category,
        paidBy: expense.paidBy,
        group: expense.group._id,
        expense: expenseDistribution,
      });
    } else {
      await createExpense({
        description: expense.description,
        date: expense.date,
        category: expense.category,
        paidBy: expense.paidBy,
        group: expense.group._id,
        expense: expenseDistribution,
      });
    }
    alert("Success", "Expense has been recorded!", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleDelete = () => {
    alert("Confirm", "Are you sure you want to delete this expense?", [
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          deleteExpense(id as string).then(() =>
            alert("Success", "Expense has been deleted!", [
              {
                text: "OK",
                onPress: () => navigation.goBack(),
              },
            ])
          ),
      },
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
    ]);
  };
  if (loading) {
    return <ActivityIndicator size="large" />;
  }
  return (
    <ThemedScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      style={styles.container}
    >
      <ThemedText style={styles.label}>Amount</ThemedText>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={expense?.amount?.toString() ?? ""}
        onChangeText={(text) => {
          handleChange("amount", text);
        }}
        onEndEditing={(e: any) => {
          const parsedValue = parseFloat(e.nativeEvent.text) || 0;
          handleChange("amount", parsedValue);
        }}
      />

      <ThemedText style={styles.label}>Description</ThemedText>
      <TextInput
        style={styles.input}
        value={expense?.description}
        onChangeText={(text) => handleChange("description", text)}
      />

      <ThemedText style={styles.label}>Date</ThemedText>
      {Platform.OS === "web" ? (
        <WebDateTimePicker
          value={expense?.date?.toISOString().slice(0, 10)}
          onChange={(date: Date) => handleChange("date", date)}
        />
      ) : (
        <DateTimePicker
          mode="single"
          date={expense?.date ?? dayjs()}
          onChange={(params) => handleChange("date", params.date)}
        />
      )}

      <ThemedText style={styles.label}>Group</ThemedText>
      <RNPickerSelect
        onValueChange={(value) => {
          handleChange(
            "group",
            userGroup.find((group) => group._id === value)
          );
        }}
        items={userGroup.map((group) => ({
          label: group.name,
          value: group._id,
        }))}
        style={pickerSelectStyles}
        value={expense?.group?._id}
        placeholder={{ label: "Select Group", value: undefined }}
      />
      <ThemedText style={styles.label}>Paid By</ThemedText>
      <RNPickerSelect
        onValueChange={(value) => handleChange("paidBy", value)}
        items={paidByOptions}
        style={pickerSelectStyles}
        value={expense?.paidBy}
        placeholder={{ label: "Paid By", value: undefined }}
      />

      <ThemedText style={styles.label}>Split Equally</ThemedText>
      <Switch
        value={expense?.splitEqually}
        onValueChange={(value) => handleChange("splitEqually", value)}
      />

      <ThemedText style={styles.label}>Type</ThemedText>
      <RNPickerSelect
        onValueChange={(value) => handleChange("category", value)}
        items={[
          { label: "Food", value: "Food" },
          {
            label: "Mandatory Household Item",
            value: "Mandatory Household Item",
          },
          {
            label: "Optional Household Item",
            value: "Optional Household Item",
          },
          { label: "Transportation", value: "Transportation" },
          { label: "Entertainment", value: "Entertainment" },
          { label: "Clothes", value: "Clothes" },
          { label: "Utilities", value: "Utilities" },
          { label: "Other", value: "Other" },
        ]}
        value={expense?.category ?? "Other"}
        style={pickerSelectStyles}
        placeholder={{ label: "Select Type", value: undefined }}
      />
      <Button
        title={id ? "Update Expense" : "Create Expense"}
        onPress={handleSubmit}
        color="#4CAF50"
      />
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  datePicker: {
    width: "100%",
    marginBottom: 15,
  },
});

const pickerSelectStyles = {
  inputIOSContainer: {
    pointerEvents: "none",
  } as StyleProp<ViewStyle>,
  inputIOS: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  inputWeb: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
};
