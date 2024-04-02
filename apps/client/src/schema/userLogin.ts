import * as Yup from 'yup';
export let userLoginSchema = Yup.object({
    email: Yup.string().email().required("Email is required"),
    password: Yup.string().required("Password is required")
  });

  export let userRegisterSchema  = Yup.object({
    email: Yup.string().email().required("Email is required"),
    password: Yup.string().required("Password is required").min(8,"Password must be atleast 8 char long").max(20,"Password max 20 chars").matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
    userName:Yup.string().required("User Name is required").min(3,"Minimum 3 character required").max(20,"Max 20 characters")
  });