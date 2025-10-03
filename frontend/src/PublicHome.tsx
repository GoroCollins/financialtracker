import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PublicHomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Top-right navigation */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/signup">Sign Up</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>

      {/* Main content */}
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Welcome to FinanceTracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Track your expenses, manage your budget, and achieve financial
            freedom with ease.
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} SkyLimTech Inc™ All rights reserved.
      </footer>
    </div>
  );
};

export default PublicHomePage;
