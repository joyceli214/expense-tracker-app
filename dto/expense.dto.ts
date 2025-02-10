export interface ExpenseDto {
  _id: string;
  expense: { user: string; amount: number }[];
  description: string;
  date: string;
  category: string;
  group: string;
  paidBy: User;
}
export interface CreateExpenseDto {
  expense: { user: string; amount: number }[];
  description: string;
  date: Date;
  category: string;
  group: string;
  paidBy: string;
}
export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Group {
  _id: string;
  name: string;
  members: User[];
}

export type NewExpenseDto = Omit<ExpenseDto, "_id">;
