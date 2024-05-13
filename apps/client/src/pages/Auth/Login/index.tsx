import { useMutation } from "@tanstack/react-query";
import useAuthService from "../../../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { Formik, Field, ErrorMessage, FormikValues } from "formik";
import { userLoginSchema } from "../../../schema/userLogin";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useState } from "react";
import { login } from "../../../store/slices/authSlice";
import { Button } from "../../../components/ui/button";

interface LoginCredentials {
  email: string;
  password: string;
}
const index = () => {
  const token = useAppSelector((state) => {
    return state.auth.token;
  });
  if (token) return <Navigate to={"/"} />;

  const [loading, setLoading] = useState(false);

  const credentials: LoginCredentials = {
    email: "",
    password: "",
  };
  const dispatch = useAppDispatch();
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
    <section className="flex items-center justify-center h-[90vh]">
      <div className="flex w-full justify-center h-[30vh]  mx-[10vw]  ">
        <div className=" ">
          <img src="login.png" className=" h-full object-cover" alt="Image" />
        </div>

        <div className="flex w-1/2  items-center ">
          <Formik
            initialValues={credentials as any}
            validationSchema={userLoginSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit }) => (
              <form onSubmit={handleSubmit} className="flex  flex-col w-full space-y-5 ">
                <div className="w-full">
                  <label htmlFor="email" className="w-full">
                    Email
                  </label>
                  <div>
                    <Field
                      type="email"
                      name="email"
                      className=" w-1/2 bg-primary-foreground px-5 py-1.5 border-[0.7px] border-slate-400 rounded-md outline-none"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className=" text-red-600"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password">
                    Password
                    <div>
                      <Field
                        type="password"
                        name="password"
                        className={` w-1/2 bg-primary-foreground  px-5 py-1.5 border-[0.7px] border-slate-400 rounded-md outline-none`}
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className=" text-red-600"
                      />
                    </div>
                  </label>
                </div>

                <Button className="w-1/2" type="submit" disabled={loading} variant={"default"}>
                  Login
                </Button>
                <Button className="w-1/2" variant={"link"}>Don't Have an account?</Button>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
};

export default index;
