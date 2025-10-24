import { useQuery } from "@tanstack/react-query";
import { AuthAPI } from "api";

export const useAuth = () => {
  const { data: user, ...queryResult } = useQuery({
    queryKey: ["user"],
    queryFn: AuthAPI.user,
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
