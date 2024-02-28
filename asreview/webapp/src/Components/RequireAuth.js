import { useLocation, Navigate } from "react-router-dom";
import useAuth from "hooks/useAuth";

const RequireAuth = ({ enforce_authentication = false, children }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (enforce_authentication === true && !auth?.logged_in) {
    return <Navigate to={"/signin"} state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
