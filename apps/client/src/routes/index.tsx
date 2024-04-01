import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loader from "../common/Loader";
import { ProtectedRoute } from "./protectedRoute";
import App from "../App";
import ErrorBoundary from "../common/error/ErrorBoundary"; // Import ErrorBoundary directly

// Lazy Loading all the pages
const LoginPage = lazy(() => import("../pages/Auth/Login"));
const SignupPage = lazy(() => import("../pages/Auth/Signup"));
const UserDashboard = lazy(() => import("../pages/UserDashboard"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard/:userId",
    element: (
      <Suspense fallback={<Loader />}>
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element:( <Suspense fallback={<Loader />}>
    <LoginPage />
  </Suspense>)
  
  },
  {
    path: "/signup",
    element:( <Suspense fallback={<Loader />}>
    <SignupPage />
  </Suspense>)
  },
  {
    path:"*",
    element:(<ErrorBoundary/>)
  }
]);

export default router;
