import { useMutation } from "@tanstack/react-query";
import useAuthService from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Formik, Field, ErrorMessage, FormikValues } from 'formik';
import * as Yup from 'yup';

interface LoginCredentials {
  email: string;
  password: string;
}

const userSchema = Yup.object({
  email: Yup.string().email().required("Email is required"),
  password: Yup.string().required("Password is required")
});

const Index = () => {
  const initialValues: LoginCredentials = {
    email: "",
    password: ""
  };

  const { loginUser } = useAuthService();
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationKey: ["login"], // mutationKey should be a string, not an array
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await loginUser(credentials);
      return data; // Assuming your loginUser function returns data directly, adjust if necessary
    },
    onSuccess: (data: any) => { // Assuming the structure of data, adjust according to your API response
      alert("Login Success");
      navigate(`/dashboard/${data.user._id}`);
    },
    onError: (error: any) => { // Catching the error object directly
      alert(error.message);
    }
  });

  const handleSubmit = (values: LoginCredentials) => {
    mutate(values);
  };

  return (
    <div>
      <h2>Login</h2>
      <Formik 
        initialValues={initialValues} 
        validationSchema={userSchema} 
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <form>
            <label htmlFor="email">Email:</label>
            <Field type="email" name="email" />
            <ErrorMessage name="email" component="div" className="text-red-600" />

            <label htmlFor="password">Password:</label>
            <Field type="password" name="password" />
            <ErrorMessage name="password" component="div" className="text-red-600" />

            <button type="submit" disabled={isSubmitting}>Submit</button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default Index;
