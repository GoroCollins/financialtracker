export const expensesTypeMap = {
  fixed: {
    label: "Fixed Expenses",
    endpoint: "/api/expenses/fixedexpenses/",
    route: "/expenses/fixed",
  },
  variable: {
    label: "Variable Expenses",
    endpoint: "/api/expenses/variableexpenses/",
    route: "/expenses/variable",
  },
  discretionary: {
    label: "Discretionary Expenses",
    endpoint: "/api/expenses/discretionaryexpenses/",
    route: "/expenses/discretionary",
  },
};

export type ExpenseTypeKey = keyof typeof expensesTypeMap;
