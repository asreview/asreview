import * as React from "react";
import { useQuery } from "react-query";
import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import { AuthAPI } from "../api";

const PersistSignIn = () => {
  const { auth, setAuth } = useAuth();
  const [isLoading, setIsLoading] = React.useState(
    !auth?.logged_in ? true : false
  );

  const { error } = useQuery("refresh", AuthAPI.refresh, {
    enabled: isLoading,
    onSettled: () => {
      setIsLoading(false);
    },
    onSuccess: (data) => {
      setAuth((prev) => {
        return {
          ...prev,
          logged_in: data.logged_in,
          username: data.username,
          id: data.id,
        };
      });
    },
    retry: false,
  });

  return <>{isLoading ? null : <Outlet />}</>;
};

export default PersistSignIn;
