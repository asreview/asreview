import { useLocation, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ children }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.username) {
    return <Navigate to={"/signin"} state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
