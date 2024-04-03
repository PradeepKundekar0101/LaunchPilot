import { useQuery } from "@tanstack/react-query";
import useProjectApi from "../../hooks/useProject";
import { useAppSelector } from "../../store/hooks"
import { Project } from "../../types/data";
import { Link } from "react-router-dom";
const index = () => {
  const user = useAppSelector((state)=>{return state.auth.user});
  const {getAllProjects} = useProjectApi();
  const {data,isLoading,isError,error} = useQuery({
    queryKey:["getAllProjects"],
    queryFn:async()=>{
      const res = await getAllProjects(user?.id!)
      console.log(res);
      console.log(res.data.data.projects);
      return res.data.data.projects;
    }
  })
  return (
    <div>
      <h1>Hello {user?.userName}</h1>
      <h1>Your projects</h1>
      <Link to="/dashboard/createProject">Create a project</Link>
      <h1>{isLoading}</h1>
      {
        data && data.map((e:Project)=>{return <div><h1>{e.projectName}</h1></div>})
      }
        
        {/* {data.map((project:Project) =><div>
          <h1>{project.projectName}</h1>
        </div>)} */}
      
    </div>
  )
}

export default index