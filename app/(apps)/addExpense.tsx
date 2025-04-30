import { ThemedText } from "@/components/ThemedText";
import { Group } from "@/dto/expense.dto";

import alert from "@/components/Alert";
import { ThemedScrollView } from "@/components/ThemedScrollView";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserContext } from "@/context/UserContext";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  updateExpense,
  extractExpenseFromImage,
  ExtractExpenseFromImageDto,
} from "@/service/expenses.service";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
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
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "react-native-ui-datepicker";

function WebDateTimePicker({ value, onChange }: any) {
  const colorScheme = useColorScheme() ?? "light";

  return createElement("input", {
    type: "date",
    value: value,
    style: {
      height: "40px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      marginBottom: "15px",
      padding: "0 10px",
      width: "100%",
      backgroundColor: colorScheme === "light" ? "#fff" : "#333",
      color: colorScheme === "light" ? "#000" : "#fff",
      boxSizing: "border-box",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSize: "14px",
      fontWeight: "normal",
      outline: "none",
    },
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
  const colorScheme = useColorScheme() ?? "light";
  const themedStyles = getThemedStyles(colorScheme);
  const navigation = useNavigation();
  const { id, groupId } = useLocalSearchParams();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [error, setError] = useState(null);
  const { user, userGroup } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
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
          paidBy: user?._id, // Set to current user's ID
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
          group.members.map((member) => ({
            label: member.name,
            value: member._id,
          }))
        );

        // Check if current user is a member of this group
        const currentUserInGroup = group.members.find(
          (member) => member._id === user?._id
        );

        // If creating a new expense (no id) and current user is in the group, set paidBy to current user
        // Otherwise, keep the existing paidBy value
        if (!id && currentUserInGroup) {
          handleChange("paidBy", user?._id);
        } else if (!expense.paidBy) {
          // Fallback to first member if no paidBy is set
          handleChange("paidBy", group.members[0]._id);
        }
      }
    }
  }, [expense?.group, user?._id]);

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

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(
        "Error",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        if (selectedAsset.base64) {
          await processImage(
            selectedAsset.base64,
            selectedAsset.mimeType || "image/jpeg"
          );
        } else {
          alert("Error", "Could not get base64 data from the selected image");
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Error", "Sorry, we need camera permissions to make this work!");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        if (selectedAsset.base64) {
          await processImage(
            selectedAsset.base64,
            selectedAsset.mimeType || "image/jpeg"
          );
        } else {
          alert("Error", "Could not get base64 data from the captured image");
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Error", "Failed to take photo");
    }
  };

  const processImage = async (base64Image: string, mimeType: string) => {
    try {
      setImageProcessing(true);

      const requestData: ExtractExpenseFromImageDto = {
        imageBase64: base64Image,
        mimeType: mimeType,
        defaultCurrency: "USD", // You could get this from user preferences if available
      };

      const extractedData = await extractExpenseFromImage(requestData);

      // Update the expense form with the extracted data
      setExpense((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          amount: extractedData.price,
          description: extractedData.itemName,
          category: mapExtractedCategoryToAppCategory(extractedData.category),
          date: new Date(extractedData.receiptDate),
        };
      });

      alert("Success", "Expense details extracted from image!");
    } catch (error) {
      console.error("Error processing image:", error);
      alert("Error", "Failed to extract expense details from image");
    } finally {
      setImageProcessing(false);
    }
  };

  // Helper function to map extracted categories to app categories
  const mapExtractedCategoryToAppCategory = (
    extractedCategory: string
  ): string => {
    const categoryMap: Record<string, string> = {
      "Food & Drink": "Food",
      Groceries: "Food",
      Restaurant: "Food",
      Transportation: "Transportation",
      Entertainment: "Entertainment",
      Utilities: "Utilities",
      Clothing: "Clothes",
      Household: "Mandatory Household Item",
    };

    return categoryMap[extractedCategory] || "Other";
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
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }
  return (
    <ThemedScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      style={baseStyles.container}
    >
      {imageProcessing && (
        <ThemedView style={baseStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <ThemedText style={{ marginTop: 10 }}>Processing image...</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={baseStyles.imagePickerContainer}>
        <TouchableOpacity
          style={baseStyles.imagePickerButton}
          onPress={pickImage}
        >
          <Ionicons
            name="images-outline"
            size={24}
            color={Colors[colorScheme].text}
          />
          <ThemedText style={baseStyles.imagePickerText}>
            Select Image
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={baseStyles.imagePickerButton}
          onPress={takePhoto}
        >
          <Ionicons
            name="camera-outline"
            size={24}
            color={Colors[colorScheme].text}
          />
          <ThemedText style={baseStyles.imagePickerText}>Take Photo</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedText style={[baseStyles.label, themedStyles.label]}>
        Amount
      </ThemedText>
      <TextInput
        style={[baseStyles.input, themedStyles.input]}
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

      <ThemedText style={[baseStyles.label, themedStyles.label]}>
        Description
      </ThemedText>
      <TextInput
        style={[baseStyles.input, themedStyles.input]}
        value={expense?.description}
        onChangeText={(text) => handleChange("description", text)}
      />

      <ThemedText style={[baseStyles.label, themedStyles.label]}>
        Date
      </ThemedText>
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

      <ThemedText style={[baseStyles.label, themedStyles.label]}>
        Group
      </ThemedText>
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
        style={themedStyles.pickerSelect}
        value={expense?.group?._id}
        placeholder={{ label: "Select Group", value: undefined }}
      />
      <ThemedText style={[baseStyles.label, themedStyles.label]}>
        Paid By
      </ThemedText>
      <RNPickerSelect
        onValueChange={(value) => handleChange("paidBy", value)}
        items={paidByOptions}
        style={themedStyles.pickerSelect}
        value={expense?.paidBy}
        placeholder={{ label: "Paid By", value: undefined }}
      />

      <ThemedText style={[baseStyles.label, themedStyles.label]}>
        Split Equally
      </ThemedText>
      <Switch
        value={expense?.splitEqually}
        onValueChange={(value) => handleChange("splitEqually", value)}
      />

      <ThemedText style={[baseStyles.label, themedStyles.label]}>
        Type
      </ThemedText>
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
        style={themedStyles.pickerSelect}
        placeholder={{ label: "Select Type", value: undefined }}
      />
      <Button
        title={id ? "Update Expense" : "Create Expense"}
        onPress={handleSubmit}
        color={colorScheme === "light" ? "#4CAF50" : "#2E7D32"}
      />
    </ThemedScrollView>
  );
}

// Base styles that don't depend on theme
const baseStyles = StyleSheet.create({
  container: {
    padding: 32,
    paddingBottom: 100,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  datePicker: {
    width: "100%",
    marginBottom: 15,
  },
  imagePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    flex: 0.48,
  },
  imagePickerText: {
    marginLeft: 8,
    fontSize: 14,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});

// Function to get theme-specific styles
function getThemedStyles(colorScheme: "light" | "dark") {
  return {
    label: {
      color: Colors[colorScheme].text,
    },
    input: {
      backgroundColor: colorScheme === "light" ? "#fff" : "#333",
    },
    pickerSelect: {
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
        backgroundColor: colorScheme === "light" ? "#fff" : "#333",
      },
      inputAndroid: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: colorScheme === "light" ? "#fff" : "#333",
      },
      inputWeb: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: colorScheme === "light" ? "#fff" : "#333",
      },
    },
  };
}
