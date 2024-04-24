import { useMutation } from "@tanstack/react-query";
import useAuthService from "../../../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { Formik, Field, ErrorMessage, FormikValues } from "formik";
import { userLoginSchema } from "../../../schema/userLogin";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useState } from "react";
import { login } from "../../../store/slices/authSlice";


interface LoginCredentials {
  email: string;
  password: string;
}
const index = () => {
  const token = useAppSelector((state) => {
    return state.auth.token;
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  if (token) return <Navigate to={"/"} />;
  const credentials: LoginCredentials = {
    email: "",
    password: "",
  };
  const { loginUser } = useAuthService();
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (values: LoginCredentials) => {
      setLoading(true);
      const { data } = await loginUser({
        email: values.email,
        password: values.password,
      });
      setLoading(false);
      return data.data;
    },
    onSuccess: (data) => {
      setLoading(false);
      alert("Login Success");
      dispatch(login(data));
      console.log(data.user);
      navigate(`/dashboard/`);
    },
    onError: (data) => {
      setLoading(false);
      alert(data.message);
    },
  });
  const handleSubmit = (values: FormikValues) => {
    try {
      mutate({ email: values.email, password: values.password });
    } catch (error) {}
  };
  return (
    <div>

              <div className="relative z-1 max-w-[17rem] ml-auto">
                <Formik
                  initialValues={credentials as any}
                  validationSchema={userLoginSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, handleSubmit }) => (
                    <form onSubmit={handleSubmit} className="body-2">
                      <label htmlFor="email">
                        Email:
                        <Field
                          type="email"
                          name="email"
                          className={`${errors.email} ? " border-red-500 border-2" : "" text-black`}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className=" text-red-600"
                        />
                      </label>

                      <label htmlFor="password">
                        Password:
                        <Field
                          type="password"
                          name="password"
                          className={`${errors.password} ? " border-red-500 border-2" : "" text-black `}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className=" text-red-600"
                        />
                      </label>

                      <button type="submit" disabled={loading}>
                        Submit
                      </button>
                    </form>
                  )}
                </Formik>
              </div>
            </div>

        

  );
};

export default index;
