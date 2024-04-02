import { useMutation } from "@tanstack/react-query";
import useAuthService from "../../../hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { Formik, Field, ErrorMessage, FormikValues } from "formik";
import { userRegisterSchema } from "../../../schema/userLogin";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { login } from "../../../store/slices/authSlice";
import { useState } from "react";

interface RegisterCredential {
  email: string;
  userName: string;
  password: string;
}
const index = () => {
  const [loading,setLoading] = useState(false);
  const token = useAppSelector((state)=>{return state.auth.token})
  if(token)
    return <Navigate to={"/"}/>
  const credentials: RegisterCredential = {
    email: "",
    password: "",
    userName: ""
  };

  const { registerUser } = useAuthService();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mutate } = useMutation({
    mutationKey: ["register"],
    mutationFn: async (values: RegisterCredential) => {
      setLoading(true);
      const { data } = await registerUser({
        email: values.email,
        password: values.password,
        userName: values.userName
      });
      setLoading(true);
      return data;
    },
    onSuccess: (data) => {
      alert("Registration Success");
      dispatch(login(data.data));
      navigate(`/verifyEmail`);
    },
    onError: (data) => {
      alert(data.message);
    },
  });
  const handleSubmit = (values: FormikValues) => {
    try {
      mutate({
        email: values.email,
        password: values.password,
        userName: values.userName
      });
    } catch (error) {}
  };
  return (
    <div>
      Login
      <Formik
        initialValues={credentials as any}
        validationSchema={userRegisterSchema}
        onSubmit={handleSubmit}
      >
        {({  errors, handleSubmit, values }) => (

          <form onSubmit={handleSubmit} className=" flex flex-col space-y-2 " >
            <label htmlFor="userName">
              UserName:
              <Field
                type="text"
                name="userName"
                className={  `${errors.userName && values.userName!==""} ? " border-red-500 border-2" : "" text-black `}
              />
              <ErrorMessage
                name="userName"
                component="div"
                className=" text-red-600"
              />
            </label>
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
                className={`${errors.password} ? " border-red-500 border-2" : "" text-black`}
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
  );
};

export default index;
