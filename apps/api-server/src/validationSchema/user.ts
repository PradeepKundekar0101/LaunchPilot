import {z} from 'zod'

const userSchema = z.object({
    name: z.string({
        required_error:"User Name is required"
    }).min(3,"User name must be atleast 3 characters").max(26,"User name can be maximum of 26 characters"),

    email:z.string({
        required_error:"Email is required"
    })
    .email("Invalid Email")
})