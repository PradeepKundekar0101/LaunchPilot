import { useMutation } from "@tanstack/react-query";
import useAuthService from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Formik, Field, ErrorMessage, FormikValues } from "formik";
import { userLoginSchema } from "../../../schema/userLogin";

interface LoginCredentials {
  email: string;
  password: string;
}
const index = () => {
  const credentials: LoginCredentials = {
    email: "",
    password: "",
  };
  const { loginUser } = useAuthService();
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (values: LoginCredentials) => {
      const { data } = await loginUser({
        email: values.email,
        password: values.password,
      });
      return data.data;
    },
    onSuccess: (data) => {
      alert("Login Success");
      navigate(`/dashboard/${data.user._id}`);
    },
    onError: (data) => {
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
      Login
      <Formik
        initialValues={credentials as any}
        validationSchema={userLoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">
              Email:
              <Field
                type="email"
                name="email"
                className={errors.email ? " border-red-500 border-2" : ""}
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
                className={errors.password ? " border-red-500 border-2" : ""}
              />
              <ErrorMessage
                name="password"
                component="div"
                className=" text-red-600"
              />
            </label>

            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default index;
