export interface ExpenseDto {
  _id: string;
  amount: number;
  description: string;
  date: Date;
  type: string;
  paidBy: string;
}

export type NewExpenseDto = Omit<ExpenseDto, "_id">;
