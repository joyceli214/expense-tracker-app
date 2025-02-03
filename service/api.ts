import { User } from "@/context/UserContext";
import { ExpenseDto } from "@/dto/expense.dto";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function getExpenses(): Promise<ExpenseDto> {
  try {
    const response = await api.get("/expense");
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function getExpensesById(id: string): Promise<ExpenseDto> {
  try {
    const response = await api.get("/expense/" + id);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
export async function getUserByEmail(email: string): Promise<User> {
  try {
    const response = await api.get("/user?email=" + email);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export default api;
