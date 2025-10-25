import { Link } from "react-router-dom";
import { InterestTypeItem } from "../../utils/zodSchemas";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  interestTypes: InterestTypeItem[];
  basePath: string;
}

const InterestTypeList: React.FC<Props> = ({ interestTypes, basePath }) => {
  if (!interestTypes.length) {
    return <p className="text-muted-foreground">No interest types found.</p>;
  }

  return (
    <div className="space-y-4">
      {interestTypes.map((type) => (
        <Card key={type.code} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{type.code}</CardTitle>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </div>
            <Button variant="outline" asChild>
              <Link to={`${basePath}/${type.code}`}>View</Link>
            </Button>
          </CardHeader>

          <Separator />

          <CardContent>
            <p className="text-xs text-muted-foreground">
              Created by <span className="font-medium">{type.created_by}</span> on{" "}
              {new Date(type.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InterestTypeList;
