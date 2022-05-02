import * as React from "react";
import AuthContext from "../context/AuthProvider";

const useAuth = () => {
  return React.useContext(AuthContext);
};

export default useAuth;
