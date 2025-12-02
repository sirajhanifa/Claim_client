import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove stored tokens/data
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");

    // Redirect to login page
    navigate("/");
  }, [navigate]);

  return null; // no UI needed
};

export default Logout;
