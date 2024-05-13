import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loader from "../common/Loader";
import { ProtectedRoute } from "./protectedRoute";
import App from "../App";


// Lazy Loading all the pages
const LandingPage = lazy(():any=>import("../pages/Landing"));
const LoginPage = lazy(():any => import("../pages/Auth/Login"));
const SignupPage = lazy(():any => import("../pages/Auth/Signup"));
const VerificationEmailSentPage = lazy(():any => import("../pages/Auth/VerifyEmail/emailSentPage"));
const EmailVerificationPage = lazy(():any=>import("../pages/Auth/VerifyEmail"))
const UserDashboard = lazy(():any => import("../pages/UserDashboard"));
const NotFound = lazy(():any => import("../pages/NotFound"));
const CreateProject =  lazy(():any => import("../pages/UserDashboard/createProject"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      {
        path: "",
        element: (
          <Suspense fallback={<Loader />}>
              <LandingPage />
          </Suspense>
        )
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          </Suspense>
        )
      },
      {
        path: "dashboard/createProject",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <CreateProject />
            </ProtectedRoute>
          </Suspense>
        )
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<Loader />}>
            {<LoginPage />}
          </Suspense>
        )
      },
      {
        path: "signup",
        element: (
          <Suspense fallback={<Loader />}>
            <SignupPage />
          </Suspense>
        )
      },
      {
        path: "verifyEmail",
        element: (
          <Suspense fallback={<Loader />}>
            <ProtectedRoute>
              <VerificationEmailSentPage/>
            </ProtectedRoute>
          </Suspense>
        )
      },
      {
        path: "verify/:userId/:token",
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
      }
    ]
  },
]);
export default router;
