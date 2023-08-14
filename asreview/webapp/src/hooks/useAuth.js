import * as React from "react";
import AuthContext from "../context/AuthProvider";

const useAuth = () => {
  const { auth } = React.useContext(AuthContext);
  React.useDebugValue(auth, (auth) =>
    auth?.logged_in ? "Signed In" : "Signed Out",
  );
  return React.useContext(AuthContext);
};

export default useAuth;
