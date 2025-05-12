import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './authentication/AuthenticationService'; // Make sure to import AuthProvider
import { BrowserRouter as Router } from 'react-router-dom';
import RoutesConfig from "./RoutesConfig";

function App() {

  return (
    <Router>
      <AuthProvider>  {/* Wrap your entire app inside AuthProvider */}
        <RoutesConfig  />
      </AuthProvider>
    </Router>
  );
}

export default App;

