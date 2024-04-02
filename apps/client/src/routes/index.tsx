import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loader from "../common/Loader";
import { ProtectedRoute } from "./protectedRoute";
import App from "../App";
import ErrorBoundary from "../common/error/ErrorBoundary"; // Import ErrorBoundary directly

// Lazy Loading all the pages
const LoginPage = lazy(() => import("../pages/Auth/Login"));
const SignupPage = lazy(() => import("../pages/Auth/Signup"));
const VerificationEmailSentPage = lazy(() => import("../pages/Auth/VerifyEmail/emailSentPage"));
const EmailVerificationPage = lazy(()=>import("../pages/Auth/VerifyEmail"))
const UserDashboard = lazy(() => import("../pages/UserDashboard"));
const NotFound = lazy(() => import("../pages/NotFound"));
const CreateProject =  lazy(() => import("../pages/UserDashboard/createProject"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard/",
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
    path: "/dashboard/createProject",
    element: (
      <Suspense fallback={<Loader />}>
        <ProtectedRoute>
          <CreateProject />
        </ProtectedRoute>
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loader />}>
        {<LoginPage />}
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<Loader />}>
        <SignupPage />
      </Suspense>
    ),
  },
  {
    path: "/verifyEmail",
    element: (
      <Suspense fallback={<Loader />}>
        <ProtectedRoute>
          <VerificationEmailSentPage/>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/verify/:userId/:token",
    element: (
      <Suspense fallback={<Loader />}>
        <ProtectedRoute>
          <EmailVerificationPage/>
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
