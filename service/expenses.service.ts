import { CreateExpenseDto, ExpenseDto } from "@/dto/expense.dto";
import { axiosInstance } from ".";
const basePath = "/expense";

export async function getExpensesSum(
  userId: string,
  from: Date,
  to: Date
): Promise<Record<string, number>> {
  try {
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
    const response = await axiosInstance.get(
      `${basePath}/stats/${userId}?from=${fromStr}&to=${toStr}`
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
export async function getExpenseById(id: string): Promise<ExpenseDto> {
  try {
    const response = await axiosInstance.get(`${basePath}/${id}`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
export async function createExpense(
  expense: CreateExpenseDto
): Promise<ExpenseDto> {
  try {
    const response = await axiosInstance.post(basePath, expense);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
export async function updateExpense(
  id: string,
  expense: CreateExpenseDto
): Promise<ExpenseDto> {
  const response = await axiosInstance.put(`${basePath}/${id}`, expense);
  return response.data;
}
export async function deleteExpense(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`${basePath}/${id}`);
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

export async function getExpensesByGroupIds(
  groupIds: string[]
): Promise<ExpenseDto[]> {
  try {
    const response = await axiosInstance.get(basePath, {
      params: { groupIds },
      paramsSerializer: (params) => {
        return params.groupIds.map((id: string) => `groupId=${id}`).join("&");
      },
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
