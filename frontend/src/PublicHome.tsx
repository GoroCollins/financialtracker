import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PublicHomePage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4">
      {/* Top-right navigation */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="outline" asChild>
          <Link to="/login">Log In</Link>
        </Button>
        <Button asChild>
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>

      {/* Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="text-center shadow-2xl border border-border/50 bg-white/70 dark:bg-gray-950/60 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              FinanceTracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-lg">
              Take control of your finances — track your income, monitor
              expenses, and visualize your financial growth effortlessly.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/signup">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <footer className="mt-10 text-sm text-muted-foreground">
        © {new Date().getFullYear()} <span className="font-semibold">SkyLimTech Inc™</span> — All rights reserved.
      </footer>
    </div>
  );
};

export default PublicHomePage;
