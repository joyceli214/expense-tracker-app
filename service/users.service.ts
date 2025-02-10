import { User } from "@/dto/expense.dto";
import { axiosInstance } from ".";

const basePath = "/user";

export async function getUserByEmail(email: string): Promise<User> {
  try {
    const response = await axiosInstance.get(`${basePath}?email=${email}`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
