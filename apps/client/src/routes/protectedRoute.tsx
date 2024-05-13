import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { jwtDecode } from "jwt-decode";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAppSelector((state) => state.auth.token);
  if (!token) {
    return <Navigate to="/login" />;
  }
  try {
    const decodedToken: any = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      alert("Session Expired")
      return <Navigate to="/login" />;
    }
  } catch (error) {
    return <Navigate to="/login" />;
  }
  return children;
};
