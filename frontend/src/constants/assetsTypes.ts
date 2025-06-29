export type AssetTypeKey = "liquid" | "equity" | "investment" | "retirement";

export const assetEndpointsMap: Record<AssetTypeKey, {
  label: string;
  singularLabel: string;
  endpoint: string;
  route: string;
}> = {
  liquid: {
    label: "Liquid Assets",
    singularLabel: "Liquid Asset",
    endpoint: "/api/assets/liquidassets/",
    route: "/assets/liquid"
  },
  equity: {
    label: "Equities",
    singularLabel: "Equity",
    endpoint: "/api/assets/equities/",
    route: "/assets/equity"
  },
  investment: {
    label: "Investment Accounts",
    singularLabel: "Investment Account",
    endpoint: "/api/assets/investmentaccounts/",
    route: "/assets/investment"
  },
  retirement: {
    label: "Retirement Accounts",
    singularLabel: "Retirement Account",
    endpoint: "/api/assets/retirementaccounts/",
    route: "/assets/retirement"
  }
};
