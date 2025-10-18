import "./App.css";
import { AuthProvider } from "./authentication/AuthenticationService";
import { BrowserRouter as Router } from "react-router-dom";
import RoutesConfig from "./RoutesConfig";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>{/* Wrap your entire app inside AuthProvider */}
          <RoutesConfig />
          <Toaster position="top-right" />
          <div className="fixed bottom-4 right-4">
            <ModeToggle />
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;


