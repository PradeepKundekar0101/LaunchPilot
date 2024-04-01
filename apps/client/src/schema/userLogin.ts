import * as Yup from 'yup';
export let userSchema = Yup.object({
    email: Yup.string().email().required("Email is required"),
    password: Yup.string().required("Password is required")
  });