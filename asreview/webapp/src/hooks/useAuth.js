import { useQuery } from "react-query";
import { AuthAPI } from "api";

export const useAuth = () => {
  const { data: user, ...queryResult } = useQuery("user", AuthAPI.user, {
    retry: false,
  });

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isMember: user?.role === "member",
    ...queryResult,
  };
};

export default useAuth;
