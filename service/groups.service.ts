import { Group } from "@/dto/expense.dto";
import { axiosInstance } from ".";

const basePath = "/group";
export async function getUserGroupsByUser(userId: string): Promise<Group[]> {
  try {
    const response = await axiosInstance.get(`${basePath}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
