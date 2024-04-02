import useAxios from './useAxios';
const useProjectApi = () => {
    const api = useAxios();
    const createProject = async (gitUrl:string, projectName:string) => {
        try {
            const response = await api.post('/project/', { gitUrl, projectName });
            return response;
        } catch (error:any) {
            throw new Error(error.response?error.response.data.message:error.message);
        }
    };

    const deployProject = async (projectId:string) => {
        try {
            const response = await api.post(`/project/deploy/${projectId}`);
            return response;
        } catch (error:any) {
            throw new Error(error.response?error.response.data.message:error.message);
        }
    };

    return { createProject, deployProject };
};

export default useProjectApi;
