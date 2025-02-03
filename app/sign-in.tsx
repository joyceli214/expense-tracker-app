import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { router } from "expo-router";
import { getUserByEmail } from "@/service/api";

const EnterEmailScreen = () => {
  const [email, setEmail] = useState("");
  const { setUser } = useContext(UserContext);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter an email");
      return;
    }

    try {
      const user = await getUserByEmail(email);
      if (user) {
        setUser(user);
        router.replace("/");
      } else {
        Alert.alert("Error", "User not found");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Alert.alert("Error", "Failed to fetch user data");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

export default EnterEmailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
  },
});
