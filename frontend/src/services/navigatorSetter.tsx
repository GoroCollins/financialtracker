import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "@/services/navigation";

const NavigatorSetter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null;
};

export default NavigatorSetter;
