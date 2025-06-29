import React from "react";
import { Link } from "react-router-dom";
import { AssetTypeKey } from "../constants/assetsTypes";

export interface AssetListItem {
  id: number;
  name: string;
  currency: string;
  amount: number;
  amount_lcy_display: string;
  created_by: string;
  created_at: string;
  asset_type: AssetTypeKey;  // Injected manually
}

interface Props {
  assets: AssetListItem[];
  basePath: string;
}

const AssetList: React.FC<Props> = ({ assets, basePath }) => (
  <div className="space-y-4 mt-6">
    {assets.map((asset) => (
      <div key={asset.id} className="border p-4 rounded shadow-sm">
        <div className="text-lg font-semibold">{asset.name}</div>
        <div className="text-gray-600 text-sm">
          • {asset.currency} {asset.amount} — {asset.amount_lcy_display}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Created by {asset.created_by} on {asset.created_at}
        </div>
        <div className="mt-3 flex gap-4">  
          <Link
            to={`${basePath}/details/${asset.id}`}
            className="text-blue-600 underline hover:text-blue-800"
          >
            View Details
          </Link>
        </div>
      </div>
    ))}
  </div>
);

export default AssetList;
