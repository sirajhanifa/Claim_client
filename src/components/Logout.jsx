import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();
    useEffect(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        navigate("/");
    }, [navigate]);
    return null;
};

export default Logout;
