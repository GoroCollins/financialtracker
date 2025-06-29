import { Link } from "react-router-dom";
import { InterestTypeItem } from "../../utils/zodSchemas";

interface Props {
  interestTypes: InterestTypeItem[];
  basePath: string;
}

const InterestTypeList: React.FC<Props> = ({ interestTypes, basePath }) => {
  if (!interestTypes.length) {
    return <p>No interest types found.</p>;
  }

  return (
    <ul className="space-y-2">
      {interestTypes.map((type) => (
        <li key={type.code} className="border p-3 rounded shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">{type.code}</p>
              <p>{type.description}</p>
              <small>Created by {type.created_by} on {type.created_at}</small>
            </div>
            <Link to={`${basePath}/${type.code}`} className="text-blue-600 underline">
              View
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default InterestTypeList;
