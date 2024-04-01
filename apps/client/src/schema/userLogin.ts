import * as Yup from 'yup';
export let userLoginSchema = Yup.object({
    email: Yup.string().email().required("Email is required"),
    password: Yup.string().required("Password is required")
  });

  export let userRegisterSchema  = Yup.object({
    email: Yup.string().email().required("Email is required"),
    password: Yup.string().required("Password is required"),
    userName:Yup.string().required("User Name is required").min(3,"Minimum 3 character required").max(20,"Max 20 characters")
  });