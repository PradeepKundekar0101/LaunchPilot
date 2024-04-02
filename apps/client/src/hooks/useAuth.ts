import useAxios from '../hooks/useAxios';
const useAuthService = () => {
    const api = useAxios();
    const loginUser = async({email,password}:{email:string,password:string})=>{
        try {
            const res = await api.post(`user/login`,{email,password});
            return res; 
        } catch (error:any) {
            throw new Error(error.response?error.response.data.message:error.message);
        }
    };
    const registerUser = async({email,password,userName}:{email:string,password:string,userName:string})=>{
        try {
            const res= await api.post(`user/register`,{email,password,userName});
            return res;
        } catch (error:any) {
            throw new Error(error.response?error.response.data.message:error.message);
        }
    }
    const isAuthenticated =async(token:string)=>{
        try {
            const res = await api.get(`auth/checkAuth`,{data:{token}});
            return res;
        } catch (error:any) {
            throw new Error(error.response?error.response.data.message:error.message);
        }
    }
   
    return { loginUser,registerUser,isAuthenticated };
};
export default useAuthService;