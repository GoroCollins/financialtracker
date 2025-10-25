import React from "react";
import { Link } from "react-router-dom";
import { AssetTypeKey } from "../constants/assetsTypes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface AssetListItem {
  id: number;
  name: string;
  currency: string;
  amount: number;
  amount_lcy_display: string;
  created_by: string;
  created_at: string;
  asset_type: AssetTypeKey; // Injected manually
}

interface Props {
  assets: AssetListItem[];
  basePath: string;
}

const AssetList: React.FC<Props> = ({ assets, basePath }) => {
  if (!assets || assets.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-8">
        No assets found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <Card key={asset.id} className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {asset.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {asset.currency} {asset.amount.toLocaleString()} —{" "}
              {asset.amount_lcy_display}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-xs text-muted-foreground">
            <div>
              Created by <span className="font-medium">{asset.created_by}</span>
            </div>
            <div>{new Date(asset.created_at).toLocaleString()}</div>
          </CardContent>

          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to={`${basePath}/details/${asset.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AssetList;
