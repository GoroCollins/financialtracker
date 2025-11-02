export interface IncomeTypeConfig {
  label: string;
  endpoint: string;
  route: string;
}

export const incomeTypeMap = {
  earned: {
    label: "Earned Income",
    endpoint: "/api/income/earnedincome/",
    route: "/income/earned",
  },
  portfolio: {
    label: "Portfolio Income",
    endpoint: "/api/income/portfolioincome/",
    route: "/income/portfolio",
  },
  passive: {
    label: "Passive Income",
    endpoint: "/api/income/passiveincome/",
    route: "/income/passive",
  },
} satisfies Record<string, IncomeTypeConfig>;

export type IncomeTypeKey = keyof typeof incomeTypeMap;
