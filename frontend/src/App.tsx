import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./RoutesConfig";

function App() {
  return (
    <BrowserRouter>
      <RoutesConfig />
    </BrowserRouter>
  );
}

export default App;
