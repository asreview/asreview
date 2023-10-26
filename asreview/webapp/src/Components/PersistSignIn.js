import * as React from "react";
import { useQuery } from "react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import { AuthAPI } from "../api";

const PersistSignIn = () => {
  const location = useLocation();
  const { auth, setAuth } = useAuth();
  const [isLoading, setIsLoading] = React.useState(
    !auth?.logged_in ? true : false,
  );

  const { isError } = useQuery("refresh", AuthAPI.refresh, {
    enabled: isLoading,
    onSettled: () => {
      setIsLoading(false);
    },
    onSuccess: (data) => {
      setAuth((prev) => {
        return {
          ...prev,
          logged_in: data.logged_in,
          name: data.name,
          id: data.id,
        };
      });
    },
    retry: false,
  });

  return (
    <>
      {!isError && (isLoading ? null : <Outlet />)}
      {isError && (
        <Navigate to={"/signin"} state={{ from: location }} replace />
      )}
    </>
  );
};

export default PersistSignIn;
